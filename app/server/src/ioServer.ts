import { Server, Socket } from "socket.io"
import { Server as HttpServer } from "http"
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
import UserDelivery from "./infra/delivery/user/UserDelivery"
import { ServerListenEventsMap, ServerPubEventsMap } from "sushi-chat-shared"
import RoomDelivery from "./infra/delivery/room/RoomDelivery"
import ChatItemDelivery from "./infra/delivery/chatItem/ChatItemDelivery"
import StampDelivery from "./infra/delivery/stamp/StampDelivery"
import { createClient } from "redis"
import IAdminRepository from "./domain/admin/IAdminRepository"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import IStampFactory from "./domain/stamp/IStampFactory"
import IAdminAuth from "./domain/admin/IAdminAuth"
import AdminAuth from "./infra/auth/AdminAuth"
import { handleSocketIOError, logError, ErrorWithCode } from "./error"

export class GlobalSocket extends Server<
  DefaultEventsMap,
  ServerPubEventsMap
> {}

export class UserSocket extends Socket<
  ServerListenEventsMap,
  ServerPubEventsMap
> {}

const createSocketIOServer = async (
  httpServer: HttpServer,
  adminRepository: IAdminRepository,
  userRepository: IUserRepository,
  roomRepository: IRoomRepository,
  chatItemRepository: IChatItemRepository,
  stampRepository: IStampRepository,
  stampFactory: IStampFactory,
  adminAuth: IAdminAuth,
) => {
  const io = new GlobalSocket(httpServer, {
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

  const chatItemDelivery = new ChatItemDelivery(io)
  const stampDelivery = new StampDelivery(io)
  const roomDelivery = new RoomDelivery(io)

  const roomService = new RealtimeRoomService(
    roomRepository,
    userRepository,
    chatItemRepository,
    roomDelivery,
    chatItemDelivery,
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
    stampFactory,
  )

  //本体
  io.on("connection", (socket: UserSocket) => {
    const userService = new UserService(
      userRepository,
      roomRepository,
      new UserDelivery(socket, io),
      adminAuth,
    )

    // デバッグ用
    if (process.env.NODE_ENV !== "production") {
      socket.use(async ([eventName, data], next) => {
        if (socket.handshake.auth.token != null) {
          const { adminId } = await new AdminAuth().verifyIdToken(
            socket.handshake.auth.token,
          )
          console.log(eventName, adminId, data)
        } else {
          console.log(eventName, data)
        }
        next()
      })
    }
    // socketのidは一意なので、それを匿名ユーザーのidとして用いる
    const userId = socket.id

    // ルームに参加する
    socket.on("ENTER_ROOM", async (received, callback) => {
      try {
        const response = await userService.enterRoom({
          userId,
          roomId: received.roomId,
          iconId: received.iconId,
          speakerTopicId: received.speakerTopicId,
        })

        callback({ result: "success", data: response })
      } catch (e) {
        handleSocketIOError(callback, "ENTER_ROOM", e)
      }
    })

    socket.on("ADMIN_ENTER_ROOM", async (received, callback) => {
      try {
        // adminの場合、EnterRoom時にidTokenが渡される
        const idToken = socket.handshake.auth.token

        const res = await userService.adminEnterRoom({
          idToken,
          userId,
          roomId: received.roomId,
        })

        callback({ result: "success", data: res })
      } catch (e) {
        handleSocketIOError(callback, "ADMIN_ENTER_ROOM", e)
      }
    })

    // トピック状態の変更
    socket.on("ADMIN_CHANGE_TOPIC_STATE", (received, callback) => {
      try {
        roomService.changeTopicState({
          userId,
          topicId: received.topicId,
          state: received.state,
        })
        callback({ result: "success", data: undefined })
      } catch (e) {
        handleSocketIOError(callback, "ADMIN_CHANGE_TOPIC_STATE", e)
      }
    })

    //messageで送られてきたときの処理
    socket.on("POST_CHAT_ITEM", async (received, callback) => {
      try {
        const commandBase: PostChatItemCommand = {
          userId,
          chatItemId: received.id,
          topicId: received.topicId,
        }
        const chatItemType = received.type
        switch (received.type) {
          case "message":
            await chatItemService.postMessage({
              ...commandBase,
              content: received.content as string,
              quoteId: received.quoteId ?? null,
            })
            break

          case "reaction":
            await chatItemService.postReaction({
              ...commandBase,
              quoteId: received.quoteId as string,
            })
            break

          case "question":
            await chatItemService.postQuestion({
              ...commandBase,
              content: received.content as string,
              quoteId: received.quoteId ?? null,
            })
            break

          case "answer":
            await chatItemService.postAnswer({
              ...commandBase,
              content: received.content as string,
              quoteId: received.quoteId as string,
            })
            break

          default:
            handleSocketIOError(
              callback,
              "POST_CHAT_ITEM",
              new ErrorWithCode(`Invalid received.type: ${chatItemType}`, 400),
            )
            return
        }
        callback({ result: "success", data: undefined })
      } catch (e) {
        handleSocketIOError(callback, "POST_CHAT_ITEM", e)
      }
    })

    // スタンプを投稿する
    socket.on("POST_STAMP", (received, callback) => {
      try {
        stampService.post({
          id: received.id,
          userId,
          topicId: received.topicId,
        })
        callback({ result: "success", data: undefined })
      } catch (e) {
        handleSocketIOError(callback, "POST_STAMP", e)
      }
    })

    socket.on("POST_PINNED_MESSAGE", (received, callback) => {
      try {
        chatItemService.pinChatItem({ chatItemId: received.chatItemId })
        callback({ result: "success", data: undefined })
      } catch (e) {
        handleSocketIOError(callback, "POST_PINNED_MESSAGE", e)
      }
    })

    // ルームを終了する
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    socket.on("ADMIN_FINISH_ROOM", (_, callback) => {
      try {
        roomService.finish({ userId: userId })
        callback({ result: "success", data: undefined })
      } catch (e) {
        handleSocketIOError(callback, "ADMIN_FINISH_ROOM", e)
      }
    })

    //接続解除時に行う処理
    socket.on("disconnect", () => {
      try {
        userService.leaveRoom({ userId })
      } catch (e) {
        logError("disconnect", e)
      }
    })
  })

  return io
}

export default createSocketIOServer
