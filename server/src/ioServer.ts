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

  let serverAwakerTimer: NodeJS.Timeout;
  let stampIntervalSenderTimer: NodeJS.Timeout;

  //サーバー起こしておくため
  function serverAwaker() {
    return setInterval(() => {
      io.sockets.emit("");
      console.log("awaker stamp", new Date());
    }, 30000);
  }

  //本体
  io.on("connection", (socket) => {
    console.log("user joined");
    activeUserCount++;
    if (activeUserCount === 1) {
      //サーバー起こしておくため
      serverAwakerTimer = serverAwaker();
      stampIntervalSenderTimer = stampIntervalSender(io, stamps);
    }

    //ルーム参加
    socket.on("ENTER_ROOM", (received: EnterRoomReceive, callback: any) => {
      console.log("entered");
      users[socket.id] = received.iconId.toString();
      const sortedChatItem = Object.values(chatItems).sort(function (a, b) {
        if (a.timestamp < b.timestamp) return 1;
        if (a.timestamp > b.timestamp) return -1;
        return 0;
      });
      console.log(socket.id, received.iconId);

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
      socket.broadcast.emit("PUB_CHAT_ITEM", {
        type: "confirm-to-send",
        content: returnItem,
      });
    });

    //stampで送られてきたときの処理
    socket.on("POST_STAMP", (received: Stamp) => {
      stampCount++;
      stamps.push({
        userId: socket.id,
        topicId: received.topicId,
      });
    });

    //stampで送られてきたときの処理
    socket.on("CHANGE_ACTIVE_TOPIC", (received: { topicId: string }) => {
      console.log(received.topicId)
      io.sockets.emit("PUB_CHANGE_ACTIVE_TOPIC", {
        topicId: received.topicId
      })
    });

    //接続解除時に行う処理
    socket.on("disconnect", (reason) => {
      console.log("disconnect: ", reason);
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
