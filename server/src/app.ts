import express from "express";
import {
  ChatItem,
  Message,
  Reaction,
  ChatItemReceive,
  MessageReceive,
  ReactionReceive,
} from "./chatItem";
import { Topic } from "./topic";
import { Stamp } from "./stamp";
import { Server } from "socket.io";
import http from "http";
import { EnterRoomReceive } from "./room";

const app = express();
var httpServer = new http.Server(app);

const PORT = process.env.PORT || 7000;

//これはチェックにちょっと表示してるだけ
app.get("/", function (_req, res) {
  res.send("hello world");
});

var users = [];
var topics: Topic[] = [];
var chatItems: ChatItem[] = [];
var activeUserCount: number = 0;

const io = new Server(httpServer);

//本体
io.on("connection", (socket) => {
  console.log("user joined");

  //ルーム参加
  socket.on("ENTER_ROOM", (received: EnterRoomReceive) => {
    console.log("entered");

    activeUserCount++;
    users.push({ id: socket.id, iconId: 0 });

    socket.emit("ENTER_ROOM", {
      chatItems: chatItems,
      topics: topics,
      activeUserCount: activeUserCount,
    });
    io.sockets.emit("PUB_ENTER_ROOM", {
      iconId: received.iconId,
      activeUserCount: activeUserCount,
    });
  });

  //ルームを立てる
  // socket.on("CREATE_ROOM", (received: RoomCreateReceive) => {
  //   console.log("room created");
  // });

  //messageで送られてきたときの処理
  socket.on("POST_CHAT_ITEM", (received: ChatItemReceive) => {
    console.log("message: " + received.id + " from " + socket.id);
    const returnItem: ChatItem =
      received.type === "message"
        ? {
            id: received.id,
            topicId: received.topicId,
            type: "message",
            iconId: "1",
            timestamp: 0,
            content: received.content,
            isQuestion: received.isQuestion,
          }
        : {
            id: received.id,
            topicId: received.topicId,
            type: "reaction",
            iconId: "1",
            timestamp: 0,
            target: {
              id: received.reactionToId,
              content: "",
            },
          };
    chatItems.push(returnItem);
    io.sockets.emit("PUB_CHAT_ITEM", {
      type: "confirm-to-send",
      content: returnItem,
    });
  });

  //stampで送られてきたときの処理
  socket.on("POST_STAMP", (received: Stamp) => {
    io.sockets.emit("PUB_STAMP", {
      topicId: received.topicId,
    });
  });

  //接続解除時に行う処理
  socket.on("disconnect", (reason) => {
    console.log("disconnect: ", reason);
    activeUserCount--;
  });
});

//これは立ててる
app.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
