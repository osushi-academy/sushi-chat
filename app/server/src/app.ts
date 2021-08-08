import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"

const app = express()
const httpServer = createServer(app)

createSocketIOServer(
  httpServer,
  LocalMemoryUserRepository.getInstance(),
  RoomRepository.getInstance(),
  new ChatItemRepository(),
  new StampRepository(),
)

const PORT = process.env.PORT || 7000
// サーバーをたてる
httpServer.listen(PORT, function () {
  console.log("server listening. Port:" + PORT)
})

app.get("/", (req, res) => res.send("ok"))
