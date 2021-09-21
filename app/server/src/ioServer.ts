import { Server, Socket } from "socket.io"
import { Server as HttpServer } from "http"
import { ReceiveEventParams, ReceiveEventResponses } from "./events"
import { instrument } from "@socket.io/admin-ui"
import { createAdapter } from "@socket.io/redis-adapter"
import { generateHash } from "./utils/crypt"
import RealtimeRoomService from "./service/room/RealtimeRoomService"
import StampService from "./service/stamp/StampService"
import UserService from "./service/user/UserService"
import ChatItemService from "./service/chatItem/ChatItemService"
import { PostChatItemCommand } from "./service/chatItem/commands"
import IUserRepository from "./domain/user/IUserRepository"
import IRoomRepository from "./domain/room/IRoomRepository"
import IChatItemRepository from "./domain/chatItem/IChatItemRepository"
import IStampRepository from "./domain/stamp/IStampRepository"
import IRoomFactory from "./domain/room/IRoomFactory"
import UserDelivery from "./infra/delivery/user/UserDelivery"
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ServerListenEventsMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ServerPubEventsMap,
} from "sushi-chat-shared"
import RoomDelivery from "./infra/delivery/room/RoomDelivery"
import ChatItemDelivery from "./infra/delivery/chatItem/ChatItemDelivery"
import StampDelivery from "./infra/delivery/stamp/StampDelivery"
import { createClient } from "redis"

const createSocketIOServer = async (
  httpServer: HttpServer,
  userRepository: IUserRepository,
  roomRepository: IRoomRepository,
  chatItemRepository: IChatItemRepository,
  stampRepository: IStampRepository,
  roomFactory: IRoomFactory,
) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // redis adapterの設定
  if (process.env.SOCKET_IO_ADAPTER?.toLowerCase() === "redis") {
    const pubClient = createClient({
      host: process.env.REDIS_HOST ?? "localhost",
      port: parseInt(process.env.REDIS_PORT ?? "6379"),
    })
    const subClient = pubClient.duplicate()
    io.adapter(createAdapter(pubClient, subClient))
  }

  // SocketIO Adminの設定
  if (
    process.env.NODE_ENV == "production" &&
    process.env.SOCKET_IO_ADMIN_UI_PASSWORD === undefined
  ) {
    throw Error("SOCKET_IO_ADMIN_UI_PASSWORD is not defined in production.")
  }
  const hashed = await generateHash(
    process.env.SOCKET_IO_ADMIN_UI_PASSWORD ?? "",
  )
  instrument(io, {
    auth: {
      type: "basic",
      username: "admin",
      password: hashed,
    },
  })

  // TODO: 削除して良い?
  let activeUserCount = 0

  const chatItemDelivery = new ChatItemDelivery(io)
  const stampDelivery = new StampDelivery(io)
  const roomService = new RealtimeRoomService(
    roomRepository,
    userRepository,
    chatItemRepository,
    new RoomDelivery(io),
    chatItemDelivery,
    stampDelivery,
    roomFactory,
  )
  const chatItemService = new ChatItemService(
    chatItemRepository,
    roomRepository,
    userRepository,
    chatItemDelivery,
  )
  const stampService = new StampService(
    stampRepository,
    roomRepository,
    userRepository,
    stampDelivery,
  )

  //本体
  io.on(
    "connection",
    (
      socket: Socket<
        {
          [K in keyof ReceiveEventParams]: (
            params: ReceiveEventParams[K],
            callback: (response: ReceiveEventResponses[K]) => void,
          ) => void
        },
        Record<string, never>
      >,
      // NOTE: 新しいAPI型
      // socket: Socket<ServerListenEventsMap, ServerPubEventsMap>,
    ) => {
      const userService = new UserService(
        userRepository,
        roomRepository,
        new UserDelivery(socket, io),
      )

      activeUserCount++
      console.log("user joined, now", activeUserCount)

      // TODO 正しい処理に直す
      const adminId = "hoge"

      // 管理者がルームに参加する
      socket.on("ADMIN_ENTER_ROOM", async (received, callback) => {
        try {
          const response = await userService.adminEnterRoom({
            adminId: adminId,
            userId: socket.id,
            roomId: received.roomId,
          })

          callback(response)
        } catch (e) {
          console.error(
            `${e ?? "Unknown error."} (ADMIN_ENTER_ROOM)`,
            new Date().toISOString(),
          )
        }
      })

      // ルームに参加する
      socket.on("ENTER_ROOM", async (received, callback) => {
        try {
          // TODO: iconIdのバリデーション挟んだ方が良いかね？
          const response = await userService.enterRoom({
            userId: socket.id,
            roomId: received.roomId,
            iconId: received.iconId,
          })

          callback(response)
        } catch (e) {
          console.log(
            `${e ?? "Unknown error."} (ENTER_ROOM)`,
            new Date().toISOString(),
          )
        }
      })

      // トピック状態の変更
      socket.on("ADMIN_CHANGE_TOPIC_STATE", (received) => {
        try {
          roomService.changeTopicState({
            userId: socket.id,
            topicId: received.topicId,
            type: received.type,
          })
        } catch (e) {
          console.error(
            `${e ?? "Unknown error."} (ADMIN_CHANGE_TOPIC_STATE)`,
            new Date().toISOString(),
          )
        }
      })

      // messageで送られてきたときの処理
      socket.on("POST_CHAT_ITEM", (received) => {
        try {
          const commandBase: PostChatItemCommand = {
            userId: socket.id,
            chatItemId: received.id,
            topicId: received.topicId,
          }
          const chatItemType = received.type
          switch (received.type) {
            case "message":
              chatItemService.postMessage({
                ...commandBase,
                content: received.content,
                targetId: received.target,
              })
              break
            case "reaction":
              chatItemService.postReaction({
                ...commandBase,
                targetId: received.reactionToId,
              })
              break
            case "question":
              chatItemService.postQuestion({
                ...commandBase,
                content: received.content,
              })
              break
            case "answer":
              chatItemService.postAnswer({
                ...commandBase,
                content: received.content,
                targetId: received.target,
              })
              break
            default:
              throw new Error(`Invalid received.type(${chatItemType})`)
          }
        } catch (e) {
          console.error(
            `${e ?? "Unknown error."} (POST_CHAT_ITEM)`,
            new Date().toISOString(),
          )
        }
      })

      // スタンプを投稿する
      socket.on("POST_STAMP", (received) => {
        try {
          stampService.post({
            userId: socket.id,
            topicId: received.topicId,
          })
        } catch (e) {
          console.error(
            `${e ?? "Unknown error."} (POST_STAMP)`,
            new Date().toISOString(),
          )
        }
      })

      // ルームを終了する
      socket.on("ADMIN_FINISH_ROOM", () => {
        try {
          roomService.finish(socket.id)
        } catch (e) {
          console.error(
            `${e ?? "Unknown error."} (ADMIN_FINISH_ROOM)`,
            new Date().toISOString(),
          )
        }
      })

      //接続解除時に行う処理
      socket.on("disconnect", () => {
        try {
          userService.leaveRoom({ userId: socket.id })
        } catch (e) {
          console.log(
            `${e ?? "Unknown error."} (LEAVE_ROOM)`,
            new Date().toISOString(),
          )
        }

        activeUserCount--
      })
    },
  )

  return io
}

export default createSocketIOServer
