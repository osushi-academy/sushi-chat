import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import { restSetup } from "./rest"
import RestRoomService from "./service/room/RestRoomService"
import RoomFactory from "./infra/factory/RoomFactory"
import PGPool from "./infra/repository/PGPool"
import AdminRepository from "./infra/repository/admin/AdminRepository"
import UserRepository from "./infra/repository/User/UserRepository"
import StampFactory from "./infra/factory/StampFactory"
import AdminService from "./service/admin/AdminService"
import AdminAuth from "./infra/auth/AdminAuth"
import cors from "cors"
import { CORS_OPTION } from "./utils/http"

const app = express()
const httpServer = createServer(app)

const pgPool = new PGPool(
  process.env.DATABASE_URL as string,
  process.env.DB_SSL !== "OFF",
)

const adminRepository = new AdminRepository(pgPool)
const userRepository = new UserRepository(pgPool)
const chatItemRepository = new ChatItemRepository(pgPool)
const stampRepository = new StampRepository(pgPool)
const roomRepository = new RoomRepository(
  pgPool,
  adminRepository,
  userRepository,
  chatItemRepository,
  stampRepository,
)

const roomFactory = new RoomFactory()
const stampFactory = new StampFactory()

const adminAuth = new AdminAuth()

const roomService = new RestRoomService(roomRepository, roomFactory)
const adminService = new AdminService(
  adminRepository,
  roomRepository,
  adminAuth,
)

createSocketIOServer(
  httpServer,
  adminRepository,
  userRepository,
  roomRepository,
  chatItemRepository,
  stampRepository,
  stampFactory,
  adminAuth,
)

const PORT = process.env.PORT || 7000
// サーバーをたてる
httpServer.listen(PORT, () => {
  console.log("server listening. Port:" + PORT)
})

// ref: https://www.npmjs.com/package/cors#configuring-cors
const myCors = () => cors(CORS_OPTION)
// NOTE: genericsでstringを指定しないと、オーバーロードがマッチしなくて型エラーが起こる
app.options<string>("*", myCors())
app.use(myCors())

app.use(express.json())

restSetup(app, roomService, adminService)
