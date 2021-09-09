import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import { Routes } from "./expressRoute"

const app = express()
const httpServer = createServer(app)

const apiRoutes: Routes = app

const userRepository = LocalMemoryUserRepository.getInstance()
const chatItemRepository = new ChatItemRepository()
const stampRepository = new StampRepository()
createSocketIOServer(
  httpServer,
  userRepository,
  new RoomRepository(userRepository, chatItemRepository, stampRepository),
  chatItemRepository,
  stampRepository,
)

const PORT = process.env.PORT || 7000
// サーバーをたてる
httpServer.listen(PORT, function () {
  console.log("server listening. Port:" + PORT)
})

app.use(express.json())

// apiRoutes.get("/room/:id/history", (req, res) => {
//   const roomId = req.params.id
//   console.log(roomId)
//   res.send({
//     result: "success",
//     data: {
//       chatItems: [],
//       stamps: [],
//       pinnedChatItemIds: [],
//     },
//   })
// })
