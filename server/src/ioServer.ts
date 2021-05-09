import { ChatItem, Message, Topic } from "./chatItem";
import { Stamp, stampIntervalSender } from "./stamp";
import { Server, Socket } from "socket.io";
import { EnterRoomReceive, BuildRoomReceive, EnterRoomResponce } from "./room";
import { Server as HttpServer } from "http";
import { v4 as uuid } from "uuid";
import RoomClass from "./models/room";
import {
  AdminBuildRoomParams,
  EnterRoomParams,
  ReceiveEventName,
  ReceiveEventParams,
  ReceiveEventResponses,
} from "./events";
import ServerSocket from "./serverSocket";

const createSocketIOServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  RoomClass.globalSocket = io;

  const rooms: Record<string, RoomClass> = {};
  const users: { [key: string]: string } = {};
  const topics: { [key: string]: Topic } = {};
  const stamps: Stamp[] = [];
  const stockedStamps: Stamp[] = [];
  const chatItems: { [key: string]: ChatItem } = {};
  const startTimes: { [key: string]: Date } = {};
  let activeUserCount: number = 0;
  let stampCount: number = 0;
  let activeTopicId: string | null = null;

  let serverAwakerTimer: NodeJS.Timeout;

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
      // activeUserCount++;
      console.log("user joined, now", activeUserCount);
      if (activeUserCount === 1) {
        //サーバー起こしておくため
        serverAwakerTimer = serverAwaker();
      }

      // ルームをたてる
      socket.on("ADMIN_BUILD_ROOM", (received, callback) => {
        const roomId = uuid();
        console.log(roomId);
        const newRoom = new RoomClass(roomId, received.title, received.topics);
        rooms[roomId] = newRoom;
        callback({
          id: newRoom.id,
          title: newRoom.title,
          topics: newRoom.topics,
        });
      });

      /** @var room このユーザーが参加しているルームID */
      let roomId: string;

      // 管理者がルームに参加する
      socket.on("ADMIN_ENTER_ROOM", (received, callback) => {
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
      });

      // ルームに参加する
      socket.on("ENTER_ROOM", (received, callback) => {
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
      });

      // ルームを開始する
      socket.on("ADMIN_START_ROOM", (received) => {
        if (roomId == null) {
          throw new Error("[sushi-chat-server] You do not joined in any room");
        }
        console.log(roomId);
        const room = rooms[roomId];
        room.startRoom();
      });

      // トピック状態の変更
      socket.on("ADMIN_CHANGE_TOPIC_STATE", (received) => {
        if (roomId == null) {
          throw new Error("[sushi-chat-server] You do not joined in any room");
        }
        const room = rooms[roomId];
        room.changeTopicState(received);
      });

      //messageで送られてきたときの処理
      // @ts-ignore
      socket.on("POST_CHAT_ITEM", (received: ChatItemReceive) => {
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
          throw new Error("[sushi-chat-server] You do not joined in any room");
        }
        const room = rooms[roomId];

        room.postChatItem(socket.id, received);
      });

      // スタンプを投稿する
      socket.on("POST_STAMP", (params) => {
        if (roomId == null) {
          throw new Error("[sushi-chat-server] You do not joined in any room");
        }
        const room = rooms[roomId];
        room.postStamp(socket.id, params);
      });

      // ルームを終了する
      socket.on("ADMIN_FINISH_ROOM", () => {
        if (roomId == null) {
          throw new Error("[sushi-chat-server] You do not joined in any room");
        }
        const room = rooms[roomId];
        room.finishRoom();
      });

      // ルームを閉じる
      socket.on("ADMIN_CLOSE_ROOM", () => {
        if (roomId == null) {
          throw new Error("[sushi-chat-server] You do not joined in any room");
        }
        const room = rooms[roomId];
        room.closeRoom();
      });

      //stampで送られてきたときの処理
      // socket.on("POST_STAMP", (received: Stamp) => {
      //   const nowTime = new Date();
      //   const timestamp =
      //     startTimes[received.topicId] == null
      //       ? 0
      //       : nowTime.getTime() - startTimes[received.topicId].getTime();
      //   stampCount++;
      //   const stamp: Stamp = {
      //     userId: socket.id,
      //     topicId: received.topicId,
      //     timestamp,
      //   };
      //   stockedStamps.push(stamp);
      //   stamps.push(stamp);
      // });

      //アクティブなトピックの変更
      // socket.on("CHANGE_ACTIVE_TOPIC", (received: { topicId: string }) => {
      //   const prevActiveTopicId = activeTopicId;

      //   if (prevActiveTopicId) {
      //     // 終了メッセージを配信
      //     const messageId = uuid();
      //     const message: ChatItem = {
      //       id: messageId,
      //       topicId: prevActiveTopicId,
      //       type: "message",
      //       iconId: "0",
      //       timestamp: 0,
      //       content:
      //         "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
      //       // @ts-ignore
      //       isQuestion: false,
      //     };
      //     io.sockets.emit("PUB_CHAT_ITEM", {
      //       type: "confirm-to-send",
      //       content: message,
      //     });
      //     // ルーム閉じを配信する処理（yuta-ike）
      //     io.sockets.emit("PUB_FINISH_TOPIC", {
      //       topicId: prevActiveTopicId,
      //       startTime: startTimes[prevActiveTopicId],
      //       endTime: new Date(),
      //       content: {
      //         chatItems: Object.values(chatItems).filter(
      //           (chatItem) => chatItem.topicId === prevActiveTopicId
      //         ),
      //         stamps: Object.values(stamps).filter(
      //           (stamp) => stamp.topicId === prevActiveTopicId
      //         ),
      //       },
      //     });
      //   }

      //   activeTopicId = received.topicId;
      //   io.sockets.emit("PUB_CHANGE_ACTIVE_TOPIC", {
      //     topicId: received.topicId,
      //   });
      //   const messageId = uuid();
      //   const message: ChatItem = {
      //     id: messageId,
      //     topicId: received.topicId,
      //     type: "message",
      //     iconId: "0",
      //     timestamp: 0,
      //     content:
      //       "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n",
      //     // @ts-ignore
      //     isQuestion: false,
      //   };
      //   io.sockets.emit("PUB_CHAT_ITEM", {
      //     type: "confirm-to-send",
      //     content: message,
      //   });
      //   chatItems[messageId] = message;

      //   startTimes[activeTopicId] = new Date();
      // });

      //接続解除時に行う処理
      socket.on("disconnect", (reason) => {
        activeUserCount--;
        if (activeUserCount === 0) {
          //サーバー起こしておくこ
          clearInterval(serverAwakerTimer);
        }
      });
    }
  );

  return io;
};

export default createSocketIOServer;
