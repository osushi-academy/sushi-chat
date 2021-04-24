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
  const chatItems: { [key: string]: ChatItem } = {};
  let activeUserCount: number = 0;
  let stampCount: number = 0;
  let firstCommentTime: number = 0;

  //本体
  io.on("connection", (socket) => {
    console.log("user joined");

    //ルーム参加
    socket.on("ENTER_ROOM", (received: EnterRoomReceive, callback: any) => {
      console.log("entered");

      activeUserCount++;
      users[socket.id] = received.iconId.toString();
      const sortedChatItem = Object.values(chatItems).sort(function (a, b) {
        if (a.timestamp < b.timestamp) return 1;
        if (a.timestamp > b.timestamp) return -1;
        return 0;
      });
      console.log(socket.id, received.iconId);

      io.sockets.emit("PUB_ENTER_ROOM", {
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
    // socket.on("CREATE_ROOM", (received: BuildRoomReceive) => {
    //   console.log("room created");
    //   received.topics.map((topic: Topic) => (topics[topic.id] = topic));
    // });

    //messageで送られてきたときの処理
    socket.on("POST_CHAT_ITEM", (received: ChatItemReceive) => {
      console.log("message: " + received.id + " from " + socket.id);
      const nowTime = new Date();
      if (firstCommentTime === 0) {
        firstCommentTime = nowTime.getTime();
      }
      const returnItem: ChatItem =
        received.type === "message"
          ? {
              id: received.id,
              topicId: received.topicId,
              type: "message",
              iconId: users[socket.id] ? users[socket.id] : "0",
              timestamp: firstCommentTime - nowTime.getTime(),
              content: received.content,
              isQuestion: received.isQuestion ? received.isQuestion : false,
            }
          : {
              id: received.id,
              topicId: received.topicId,
              type: "reaction",
              iconId: users[socket.id] ? users[socket.id] : "0",
              timestamp: firstCommentTime - nowTime.getTime(),
              target: {
                id: received.reactionToId,
                content:
                  chatItems[received.reactionToId].type === "message"
                    ? (chatItems[received.reactionToId] as Message).content
                    : "",
              },
            };
      chatItems[received.id] = returnItem;
      io.sockets.emit("PUB_CHAT_ITEM", {
        type: "confirm-to-send",
        content: returnItem,
      });
    });

    //stampで送られてきたときの処理
    socket.on("POST_STAMP", (received: Stamp) => {
      stampCount++;
      stamps.push({
        topicId: received.topicId,
      });
    });

    //このこが2秒毎にスタンプを送る
    stampIntervalSender(io, stamps);

    //接続解除時に行う処理
    socket.on("disconnect", (reason) => {
      console.log("disconnect: ", reason);
      activeUserCount--;
    });
  });

  return io;
};

export default createSocketIOServer;
