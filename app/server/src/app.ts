import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import { Routes } from "./expressRoute"
import PGPool from "./infra/repository/PGPool"

const app = express()
const httpServer = createServer(app)


const apiRoutes: Routes = app


const pgPool = new PGPool(
  process.env.DATABASE_URL as string,
  process.env.DB_SSL !== "OFF",
)

const userRepository = LocalMemoryUserRepository.getInstance()
const chatItemRepository = new ChatItemRepository(pgPool)
const stampRepository = new StampRepository(pgPool)
createSocketIOServer(
  httpServer,
  userRepository,
  new RoomRepository(
    pgPool,
    userRepository,
    chatItemRepository,
    stampRepository,
  ),
  chatItemRepository,
  stampRepository,
)

const PORT = process.env.PORT || 7000
// サーバーをたてる
httpServer.listen(PORT, () => {
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
