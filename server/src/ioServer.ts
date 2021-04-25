import {
  ChatItem,
  Message,
  Reaction,
  ChatItemReceive,
  MessageReceive,
  ReactionReceive,
} from "./chatItem";
import { Topic } from "./topic";
import { Stamp, stampIntervalSender } from "./stamp";
import { Server } from "socket.io";
import { EnterRoomReceive, BuildRoomReceive } from "./room";
import { Server as HttpServer } from "http";
import { v4 as uuid } from "uuid";

const createSocketIOServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
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
  let stampIntervalSenderTimer: NodeJS.Timeout;

  //サーバー起こしておくため
  function serverAwaker() {
    return setInterval(() => {
      io.sockets.emit("");
    }, 30000);
  }

  //本体
  io.on("connection", (socket) => {
    activeUserCount++;
    console.log("user joined, now", activeUserCount);
    if (activeUserCount === 1) {
      //サーバー起こしておくため
      serverAwakerTimer = serverAwaker();
      stampIntervalSenderTimer = stampIntervalSender(io, stockedStamps);
    }

    //ルーム参加
    socket.on("ENTER_ROOM", (received: EnterRoomReceive, callback: any) => {
      users[socket.id] = received.iconId.toString();
      const sortedChatItem = Object.values(chatItems).sort(function (a, b) {
        if (a.timestamp < b.timestamp) return 1;
        if (a.timestamp > b.timestamp) return -1;
        return 0;
      });

      socket.broadcast.emit("PUB_ENTER_ROOM", {
        iconId: received.iconId,
        activeUserCount,
      });
      callback({
        chatItems: sortedChatItem,
        topics: Object.values(topics),
        activeUserCount,
      });
    });

    //ルームを立てる
    socket.on("CREATE_ROOM", (received: BuildRoomReceive) => {
      console.log("room created");
      received.topics.map((topic: Topic) => (topics[topic.id] = topic));
    });

    //messageで送られてきたときの処理
    socket.on("POST_CHAT_ITEM", (received: ChatItemReceive) => {
      console.log(
        received.type === "message"
          ? "message: " + received.content + " (id: " + received.id + ")"
          : "reaction: to" + received.reactionToId
      );
      const nowTime = new Date();
      const timestamp =
        startTimes[received.topicId] == null
          ? 0
          : nowTime.getTime() - startTimes[received.topicId].getTime();
      const returnItem: ChatItem =
        received.type === "message"
          ? {
              id: received.id,
              topicId: received.topicId,
              type: "message",
              iconId: users[socket.id] ? users[socket.id] : "0",
              timestamp,
              content: received.content,
              isQuestion: received.isQuestion ? received.isQuestion : false,
            }
          : {
              id: received.id,
              topicId: received.topicId,
              type: "reaction",
              iconId: users[socket.id] ? users[socket.id] : "0",
              timestamp,
              target: {
                id: received.reactionToId,
                content:
                  chatItems[received.reactionToId]?.type === "message"
                    ? (chatItems[received.reactionToId] as Message).content
                    : "",
              },
            };
      chatItems[received.id] = returnItem;
      socket.broadcast.emit("PUB_CHAT_ITEM", {
        type: "confirm-to-send",
        content: returnItem,
      });
    });

    //stampで送られてきたときの処理
    socket.on("POST_STAMP", (received: Stamp) => {
      const nowTime = new Date();
      const timestamp =
        startTimes[received.topicId] == null
          ? 0
          : nowTime.getTime() - startTimes[received.topicId].getTime();
      stampCount++;
      const stamp: Stamp = {
        userId: socket.id,
        topicId: received.topicId,
        timestamp,
      };
      stockedStamps.push(stamp);
      stamps.push(stamp);
    });

    //アクティブなトピックの変更
    socket.on("CHANGE_ACTIVE_TOPIC", (received: { topicId: string }) => {
      const prevActiveTopicId = activeTopicId;

      if (prevActiveTopicId) {
        // 終了メッセージを配信
        const messageId = uuid();
        const message: ChatItem = {
          id: messageId,
          topicId: prevActiveTopicId,
          type: "message",
          iconId: "0",
          timestamp: 0,
          content:
            "【運営Bot】\n 発表が終了しました！\n（引き続きコメントを投稿いただけます）",
          isQuestion: false,
        };
        io.sockets.emit("PUB_CHAT_ITEM", {
          type: "confirm-to-send",
          content: message,
        });
        // ルーム閉じを配信する処理（yuta-ike）
        io.sockets.emit("PUB_FINISH_TOPIC", {
          topicId: prevActiveTopicId,
          startTime: startTimes[prevActiveTopicId],
          endTime: new Date(),
          content: {
            chatItems: Object.values(chatItems).filter(
              (chatItem) => chatItem.topicId === prevActiveTopicId
            ),
            stamps: Object.values(stamps).filter(
              (stamp) => stamp.topicId === prevActiveTopicId
            ),
          },
        });
      }

      activeTopicId = received.topicId;
      io.sockets.emit("PUB_CHANGE_ACTIVE_TOPIC", {
        topicId: received.topicId,
      });
      const messageId = uuid();
      const message: ChatItem = {
        id: messageId,
        topicId: received.topicId,
        type: "message",
        iconId: "0",
        timestamp: 0,
        content:
          "【運営Bot】\n 発表が始まりました！\nコメントを投稿して盛り上げましょう 🎉🎉\n",
        isQuestion: false,
      };
      io.sockets.emit("PUB_CHAT_ITEM", {
        type: "confirm-to-send",
        content: message,
      });
      chatItems[messageId] = message;

      startTimes[activeTopicId] = new Date();
    });

    //接続解除時に行う処理
    socket.on("disconnect", (reason) => {
      activeUserCount--;
      if (activeUserCount === 0) {
        //サーバー起こしておくこ
        clearInterval(serverAwakerTimer);
        //このこが2秒毎にスタンプを送る
        clearInterval(stampIntervalSenderTimer);
      }
    });
  });

  return io;
};

export default createSocketIOServer;
