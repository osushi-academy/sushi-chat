import express from "express";
import http from "http";
import createSocketIOServer from './ioServer'

const app = express();
const httpServer = new http.Server(app);

createSocketIOServer(httpServer)

const PORT = process.env.PORT || 7000;

//これはチェックにちょっと表示してるだけ
app.get("/", function (_req, res) {
  res.send("hello world");
});

//これは立ててる
app.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
