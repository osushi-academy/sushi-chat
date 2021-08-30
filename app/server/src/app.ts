import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import PGPoolBuilder from "./infra/repository/PGPoolBuilder"

const app = express()
const httpServer = createServer(app)

const pgPoolBuilder = new PGPoolBuilder(
  process.env.DATABASE_URL as string,
  process.env.DB_SSL !== "OFF",
)
const pgPool = pgPoolBuilder.build()
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
httpServer.listen(PORT, function () {
  console.log("server listening. Port:" + PORT)
})

app.get("/", (req, res) => res.send("ok"))
