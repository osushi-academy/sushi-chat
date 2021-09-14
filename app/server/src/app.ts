import express from "express"
import { createServer } from "http"
import createSocketIOServer from "./ioServer"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import PGPool from "./infra/repository/PGPool"
import cors from "cors"
import checkAndGetUserId from "./utils/auth"

const app = express()
const httpServer = createServer(app)

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

app.use(cors())

app.get("/", (req, res) => res.send("ok"))

app.get("/auth-test", async (req, res) => {
  const userId = await checkAndGetUserId(req, res)
  return res.status(200).json({
    result: "success",
    data: {
      userId,
    },
  })
})
