import Answer from "./domain/chatItem/Answer"
import Message from "./domain/chatItem/Message"
import Question from "./domain/chatItem/Question"
import Reaction from "./domain/chatItem/Reaction"
import { Routes } from "./expressRoute"
import AdminService from "./service/admin/AdminService"
import RestRoomService from "./service/room/RestRoomService"
import { covertToNewTopicArray } from "./utils/topics"

export const restSetup = (
  app: Routes,
  roomService: RestRoomService,
  adminService: AdminService,
) => {
  app.get("/", (req, res) => res.send("ok"))

  // 管理しているルーム一覧を取得する
  app.get("/room", async (req, res) => {
    try {
      // TODO:adminIdをheaderから取得
      const adminId = ""

      const rooms = await adminService.getManagedRooms({ adminId: adminId })

      res.send({
        result: "success",
        data: rooms.map((room) => {
          return {
            id: room.id,
            title: room.title,
            description: room.description,
            topics: covertToNewTopicArray(room.topics),
            state: room.state,
            adminInviteKey: room.adminInviteKey,
            startDate: room.startAt.toDateString(),
          }
        }),
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `${e ?? "Unknown error."} (ADMIN_GET_ROOMS)`,
        },
      })
    }
  })

  // 新しくルームを作成する
  app.post("/room", (req, res) => {
    try {
      const newRoom = roomService.build({
        title: req.body.title,
        topics: req.body.topics,
        description: req.body.description,
      })
      res.send({
        result: "success",
        data: {
          id: newRoom.id,
          title: newRoom.title,
          description: newRoom.description,
          topics: covertToNewTopicArray(newRoom.topics),
          state: newRoom.state,
          adminInviteKey: newRoom.adminInviteKey,
          startDate: null,
        },
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `${e ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
        },
      })
    }
  })

  // ルームを開始する
  app.put("/room/:id/start", async (req, res) => {
    try {
      // TODO:adminIdをheaderから取得
      const adminId = ""
      await roomService.start({
        id: req.params.id,
        adminId: adminId,
      })
      res.send({ result: "success", data: undefined })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `${e.message ?? "Unknown error."} (ADMIN_START_ROOM)`,
        },
      })
    }
  })

  // ルームを公開停止にする
  app.put("/room/:id/archive", (req, res) => {
    // TODO:adminIdをheaderから取得
    const adminId = ""
    roomService
      .archive({
        id: req.params.id,
        adminId: adminId,
      })
      .then(() => res.send({ result: "success", data: undefined }))
      .catch((e) => {
        res.status(400).send({
          result: "error",
          error: {
            code: "ERROR_CODE",
            message: `${e ?? "Unknown error."} (ADMIN_ARCHIVE_ROOM)`,
          },
        })
      })
  })

  // チャット履歴・スタンプ履歴を取得する
  app.get("/room/:id/history", async (req, res) => {
    try {
      const room = await roomService.find(req.params.id)

      const chatItems = room.chatItems.map((chatItem) => ({
        ...chatItem,
        type:
          chatItem instanceof Message
            ? ("message" as const)
            : chatItem instanceof Reaction
            ? ("reaction" as const)
            : chatItem instanceof Question
            ? ("question" as const)
            : ("answer" as const),
        createdAt: chatItem.createdAt.toISOString(),
        iconId: chatItem.iconId as unknown as number,
      }))

      const stamps = room.stamps.map((stamp) => ({
        ...stamp,
        createdAt: stamp.createdAt.toISOString(),
      }))

      res.send({
        result: "success",
        data: {
          chatItems,
          stamps,
          pinnedChatItemIds: room.pinnedChatItemIds,
        },
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `${e ?? "Unknown error."} (USER_ROOM_HISTORY)`,
        },
      })
    }
  })

  // ルーム情報を取得する
  app.get("/room/:id", async (req, res) => {
    try {
      const roomId = req.params.id
      const adminId = "hoge" /* 本当はヘッダーから。 */

      const room = await roomService.checkAdminAndfind({
        id: roomId,
        adminId: adminId,
      })

      res.send({
        result: "success",
        data: room,
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `${e.message ?? "Unknown error."} (USER_FIND_ROOM)`,
        },
      })
    }
  })

  // ルームと新しい管理者を紐付ける
  app.put("/room/:id/invited", (req, res) => {
    const adminInviteKey = req.query["admin_invite_key"]
    if (!adminInviteKey) {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `invite admin needs admin_invite_key. (ADMIN_INVITE_ROOM)`,
        },
      })
      return
    }
    if (typeof adminInviteKey !== "string") {
      res.status(400).send({
        result: "error",
        error: {
          code: "ERROR_CODE",
          message: `invaild parameter. (ADMIN_INVITE_ROOM)`,
        },
      })
      return
    }
    roomService
      .inviteAdmin({
        id: req.params.id,
        adminInviteKey: adminInviteKey,
        adminId: "af3b9483-a1dc-478f-a2ec-a1e7a7c72a12",
      })
      .then(() => res.send({ result: "success", data: undefined }))
      .catch((e) => {
        res.status(400).send({
          result: "error",
          error: {
            code: "ERROR_CODE",
            message: `${e ?? "Unknown error."} (ADMIN_INVITE_ROOM)`,
          },
        })
      })
  })
}
