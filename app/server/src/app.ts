import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import { restSetup } from "./rest"
import RestRoomService from "./service/room/RestRoomService"
import { Routes } from "./expressRoute"
import RoomFactory from "./infra/factory/RoomFactory"
import PGPool from "./infra/repository/PGPool"
import AdminService from "./service/admin/AdminService"
import AdminRepository from "./infra/repository/admin/AdminRepository"

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
const adminRepository = new AdminRepository(pgPool)
const roomRepository = new RoomRepository(
  pgPool,
  userRepository,
  chatItemRepository,
  stampRepository,
)
const roomFactory = new RoomFactory()
const roomService = new RestRoomService(roomRepository, roomFactory)
const adminService = new AdminService(adminRepository, roomRepository)

createSocketIOServer(
  httpServer,
  userRepository,
  roomRepository,
  chatItemRepository,
  stampRepository,
  roomFactory,
)

const PORT = process.env.PORT || 7000
// サーバーをたてる
httpServer.listen(PORT, () => {
  console.log("server listening. Port:" + PORT)
})

app.use(express.json())

restSetup(app, roomService, adminService)

// NOTE: apiRoutesの使い方の例
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
