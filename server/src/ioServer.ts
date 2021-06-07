import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { v4 as uuid } from "uuid";
import RoomClass from "./models/room";
import SaveChatItemClass from "./saveChatItem";
import { ReceiveEventParams, ReceiveEventResponses } from "./events";
import ServerSocket from "./serverSocket";
import { clientCreate, insertRoom, insertTopics } from "./database/database";
import { Client } from "pg";

const createSocketIOServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  RoomClass.globalSocket = io;

  const rooms: Record<string, RoomClass> = {};
  const client: Client = clientCreate();
  SaveChatItemClass.client = client;

  let activeUserCount: number = 0;
  let serverAwakerTimer: NodeJS.Timeout;
  let chatItemIntervalSaverTimer: NodeJS.Timeout;

  //サーバー起こしておくため
  function serverAwaker() {
    return setInterval(() => {
      io.sockets.emit("");
    }, 30000);
  }

  //本体
  io.on(
    "connection",
    (
      socket: Socket<
        {
          [K in keyof ReceiveEventParams]: (
            params: ReceiveEventParams[K],
            callback: (response: ReceiveEventResponses[K]) => void
          ) => void;
        },
        {}
      >
    ) => {
      activeUserCount++;
      console.log("user joined, now", activeUserCount);
      if (activeUserCount === 1) {
        //サーバー起こしておくため
        serverAwakerTimer = serverAwaker();
        //1分ごとにchatItemをDBに保存するため
        chatItemIntervalSaverTimer = SaveChatItemClass.chatItemIntervalSaver();
      }

      // ルームをたてる
      socket.on("ADMIN_BUILD_ROOM", (received, callback) => {
        try {
          const roomId = uuid();
          const newRoom = new RoomClass(
            roomId,
            received.title,
            received.topics,
            client
          );
          rooms[roomId] = newRoom;
          console.log(`new room build: ${roomId}`);
          //DBにセーブ
          insertRoom(client, newRoom.id, "", newRoom.title, 0);
          insertTopics(client, roomId, newRoom.topics);
          callback({
            id: newRoom.id,
            title: newRoom.title,
            topics: newRoom.topics,
          });
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
            new Date().toISOString()
          );
        }
      });

      /** @var room このユーザーが参加しているルームID */
      let roomId: string;

      // 管理者がルームに参加する
      socket.on("ADMIN_ENTER_ROOM", (received, callback) => {
        try {
          if (!(received.roomId in rooms)) {
            throw new Error("[sushi-chat-server] Room does not exists.");
          }

          const room = rooms[received.roomId];
          const serverSocket = new ServerSocket(socket, received.roomId);
          room.joinUser(serverSocket, "0");

          roomId = room.id;

          callback({
            chatItems: room.getChatItems(),
            topics: room.topics,
            activeUserCount: room.activeUserCount,
          });
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_ENTER_ROOM)`,
            new Date().toISOString()
          );
        }
      });

      // ルームに参加する
      socket.on("ENTER_ROOM", (received, callback) => {
        try {
          if (!(received.roomId in rooms)) {
            throw new Error("[sushi-chat-server] Room does not exists.");
          }

          const room = rooms[received.roomId];
          const serverSocket = new ServerSocket(socket, received.roomId);
          room.joinUser(serverSocket, received.iconId);

          roomId = room.id;

          callback({
            chatItems: room.getChatItems(),
            topics: room.topics,
            activeUserCount: room.activeUserCount,
          });
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ENTER_ROOM)`,
            new Date().toISOString()
          );
        }
      });

      // ルームを開始する
      socket.on("ADMIN_START_ROOM", (_) => {
        try {
          if (roomId == null) {
            throw new Error(
              "[sushi-chat-server] You do not joined in any room"
            );
          }
          const room = rooms[roomId];
          room.startRoom();
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_START_ROOM)`,
            new Date().toISOString()
          );
        }
      });

      // トピック状態の変更
      socket.on("ADMIN_CHANGE_TOPIC_STATE", (received) => {
        try {
          if (roomId == null) {
            throw new Error(
              "[sushi-chat-server] You do not joined in any room"
            );
          }
          const room = rooms[roomId];
          console.log(received);
          room.changeTopicState(received);
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_CHANGE_TOPIC_STATE)`,
            new Date().toISOString()
          );
        }
      });

      //messageで送られてきたときの処理
      // @ts-ignore
      socket.on("POST_CHAT_ITEM", (received: ChatItemReceive) => {
        try {
          console.log(
            received.type === "message"
              ? "message: " + received.content + " (id: " + received.id + ")"
              : received.type === "reaction"
              ? "reaction: to " + received.reactionToId
              : received.type === "question"
              ? "question: " + received.content + " (id: " + received.id + ")"
              : "answer: " + received.content + " (id: " + received.id + ")"
          );

          if (roomId == null) {
            throw new Error(
              "[sushi-chat-server] You do not joined in any room"
            );
          }
          const room = rooms[roomId];

          room.postChatItem(socket.id, received);
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (POST_CHAT_ITEM)`,
            new Date().toISOString()
          );
        }
      });

      // スタンプを投稿する
      socket.on("POST_STAMP", (params) => {
        try {
          if (roomId == null) {
            throw new Error(
              "[sushi-chat-server] You do not joined in any room"
            );
          }
          const room = rooms[roomId];
          room.postStamp(socket.id, params);
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (POST_STAMP)`,
            new Date().toISOString()
          );
        }
      });

      // ルームを終了する
      socket.on("ADMIN_FINISH_ROOM", () => {
        try {
          if (roomId == null) {
            throw new Error(
              "[sushi-chat-server] You do not joined in any room"
            );
          }
          const room = rooms[roomId];
          room.finishRoom();
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_FINISH_ROOM)`,
            new Date().toISOString()
          );
        }
      });

      // ルームを閉じる
      socket.on("ADMIN_CLOSE_ROOM", () => {
        try {
          if (roomId == null) {
            throw new Error(
              "[sushi-chat-server] You do not joined in any room"
            );
          }
          const room = rooms[roomId];
          room.closeRoom();
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_CLOSE_ROOM)`,
            new Date().toISOString()
          );
        }
      });

      //接続解除時に行う処理
      socket.on("disconnect", (reason) => {
        activeUserCount--;
        if (activeUserCount === 0) {
          //サーバー起こしておくこ
          clearInterval(serverAwakerTimer); //DBに保存する子
          clearInterval(chatItemIntervalSaverTimer);
          //残っているものをセーブしておく
          SaveChatItemClass.saveChatItem();
        }
      });
    }
  );

  return io;
};

export default createSocketIOServer;
