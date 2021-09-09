import { Server, Socket } from "socket.io"
import { Server as HttpServer } from "http"
import { ReceiveEventParams, ReceiveEventResponses } from "./events"
import { instrument } from "@socket.io/admin-ui"
import { generateHash } from "./utils/crypt"
import RoomService from "./service/room/RoomService"
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
import RoomDelivery from "./infra/delivery/room/RoomDelivery"
import ChatItemDelivery from "./infra/delivery/chatItem/ChatItemDelivery"
import StampDelivery from "./infra/delivery/stamp/StampDelivery"

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
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

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
  const roomService = new RoomService(
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
    ) => {
      const userService = new UserService(
        userRepository,
        roomRepository,
        new UserDelivery(socket, io),
      )

      const userId = socket.id
      userService.createUser({ userId })

      activeUserCount++
      console.log("user joined, now", activeUserCount)

      // ルームをたてる
      socket.on("ADMIN_BUILD_ROOM", async (received, callback) => {
        try {
          const newRoom = await roomService.build({
            title: received.title,
            topics: received.topics,
          })

          callback({
            id: newRoom.id,
            title: newRoom.title,
            topics: newRoom.topics,
          })
        } catch (e) {
          console.error(
            `${e.message ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
            new Date().toISOString(),
          )
        }
      })

      // 管理者がルームに参加する
      socket.on("ADMIN_ENTER_ROOM", async (received, callback) => {
        try {
          const response = await userService.adminEnterRoom({
            adminId: socket.id,
            roomId: received.roomId,
          })

          callback(response)
        } catch (e) {
          console.error(
            `${e.message ?? "Unknown error."} (ADMIN_ENTER_ROOM)`,
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
            `${e.message ?? "Unknown error."} (ENTER_ROOM)`,
            new Date().toISOString(),
          )
        }
      })

      // ルームを開始する
      socket.on("ADMIN_START_ROOM", () => {
        try {
          roomService.start(socket.id)
        } catch (e) {
          console.log(
            `${e.message ?? "Unknown error."} (ADMIN_START_ROOM)`,
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
            `${e.message ?? "Unknown error."} (ADMIN_CHANGE_TOPIC_STATE)`,
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
            `${e.message ?? "Unknown error."} (POST_CHAT_ITEM)`,
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
            `${e.message ?? "Unknown error."} (POST_STAMP)`,
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
            `${e.message ?? "Unknown error."} (ADMIN_FINISH_ROOM)`,
            new Date().toISOString(),
          )
        }
      })

      // ルームを閉じる
      socket.on("ADMIN_CLOSE_ROOM", () => {
        try {
          roomService.close(socket.id)
          // TODO: 全ユーザーをSocketIO Roomから強制退室（leave）させる処理があった方が良いかも？（なくても良さそうだけど）
        } catch (e) {
          console.error(
            `${e.message ?? "Unknown error."} (ADMIN_CLOSE_ROOM)`,
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
            `${e.message ?? "Unknown error."} (LEAVE_ROOM)`,
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
