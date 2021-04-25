import express from "express";
import { createServer } from "http";
import { saveObject } from "./gssSave";
import createSocketIOServer from "./ioServer";

const app = express();
const httpServer = createServer(app);

createSocketIOServer(httpServer);
saveObject("test", { a: "a", b: "b" });

const PORT = process.env.PORT || 7000;
// サーバーをたてる
httpServer.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
