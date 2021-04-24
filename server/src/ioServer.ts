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
import { EnterRoomReceive } from "./room";
import { Server as HttpServer } from "http";

const createSocketIOServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer);
  const users: { [key: string]: string } = {};
  const topics: { [key: string]: Topic } = {};
  const chatItems: { [key: string]: ChatItem } = {};
  let activeUserCount: number = 0;

  //本体
  io.on("connection", (socket) => {
    console.log("user joined");

    //ルーム参加
    socket.on("ENTER_ROOM", (received: EnterRoomReceive, callback: any) => {
      console.log("entered");

      activeUserCount++;
      users[socket.id] = received.iconId;
      console.log(socket.id, received.iconId);

      // socket.emit("ENTER_ROOM", {
      //   chatItems: chatItems,
      //   topics: topics,
      //   activeUserCount: activeUserCount,
      // });
      io.sockets.emit("PUB_ENTER_ROOM", {
        iconId: received.iconId,
        activeUserCount: activeUserCount,
      });
      callback({
        chatItems: Object.values(chatItems),
        topics: Object.values(topics),
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
              iconId: users[socket.id],
              timestamp: 0,
              content: received.content,
              isQuestion: received.isQuestion,
            }
          : {
              id: received.id,
              topicId: received.topicId,
              type: "reaction",
              iconId: users[socket.id],
              timestamp: 0,
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

  return io;
};

export default createSocketIOServer;
function getArrayValues(chatItems: { [key: string]: ChatItem }) {
  throw new Error("Function not implemented.");
}
