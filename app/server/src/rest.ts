import Message from "./domain/chatItem/Message"
import Question from "./domain/chatItem/Question"
import Reaction from "./domain/chatItem/Reaction"
import { Routes } from "./expressRoute"
import express from "express"
import AdminService from "./service/admin/AdminService"
import RestRoomService from "./service/room/RestRoomService"
import { covertToNewTopicArray } from "./utils/topics"
import { handleRestError, ErrorWithCode } from "./error"

export const restSetup = (
  app: Routes,
  roomService: RestRoomService,
  adminService: AdminService,
) => {
  // For health check
  app.get("/", (req, res) => res.send("ok"))

  // TODO: controllerに処理を書きすぎてるので修正する
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
        iconId: chatItem.user.iconId as unknown as number,
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
          pinnedChatItemIds: room.pinnedChatItemIds.filter(
            (chatItemId): chatItemId is string => chatItemId != null,
          ),
        },
      })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  // ルーム情報を取得する
  app.get("/room/:id", async (req, res) => {
    const token = extractToken(req.headers.authorization)

    let adminId = undefined
    if (token) {
      try {
        adminId = await adminService.verifyToken(token)
      } catch (e) {
        handleRestError(e, req.route, res)
        return
      }
    }

    try {
      const room = await roomService.checkAdminAndfind({
        id: req.params.id,
        adminId,
      })

      res.send({
        result: "success",
        data: room,
      })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  // adminの認証/認可が必要なエンドポイントのルーター
  const _adminRouter = express.Router()
  app.use("/", _adminRouter)

  // NOTE: 無理矢理型を効かせるため
  const adminRouter = _adminRouter as unknown as Routes

  // AuthorizationヘッダからidTokenをextractし、検証結果をbodyに入れる
  adminRouter.use(async (req, res, next) => {
    const token = extractToken(req.headers.authorization)
    if (!token) {
      handleRestError(
        new ErrorWithCode(
          "Token is missing; e.g. Authorization: Bearer <ID_TOKEN>",
          401,
        ),
        req.route,
        res,
      )
      return
    }

    try {
      const adminId = await adminService.verifyToken(token)
      // TODO:bodyがanyで入れるの簡単だったので入れてるが、本当は専用のフィールドに入れたい
      req.body.adminId = adminId
    } catch (e) {
      handleRestError(e, req.route, res)
      return
    }

    next()
  })

  // 管理しているルーム一覧を取得する
  adminRouter.get("/room", async (req, res) => {
    try {
      const [rooms] = await Promise.all([
        adminService.getManagedRooms(
          // TODO: adminIdがrequestの型定義にないので静的解析エラーになる。adminIdを適切な場所に入れるようにする
          // @ts-ignore
          req.body.adminId,
        ),
      ])

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
            startDate: room.startAt?.toISOString() ?? undefined,
          }
        }),
      })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  // 新しくルームを作成する
  adminRouter.post("/room", async (req, res) => {
    try {
      const newRoom = await roomService.build({
        title: req.body.title,
        topics: req.body.topics,
        description: req.body.description,
        // TODO: adminIdがrequestの型定義にないので静的解析エラーになる。adminIdを適切な場所に入れるようにする
        // @ts-ignore
        adminId: req.body.adminId,
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
          startDate: undefined,
        },
      })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  // ルームを開始する
  adminRouter.put("/room/:id/start", async (req, res) => {
    try {
      await roomService.start({
        id: req.params.id,
        adminId: req.body.adminId,
      })
      res.send({ result: "success", data: undefined })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  // ルームを公開停止にする
  adminRouter.put("/room/:id/archive", async (req, res) => {
    try {
      await roomService.archive({
        id: req.params.id,
        adminId: req.body.adminId,
      })
      res.send({ result: "success", data: undefined })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  // ルームと新しい管理者を紐付ける
  adminRouter.post("/room/:id/invited", async (req, res) => {
    const adminInviteKey = req.query["admin_invite_key"]
    if (!adminInviteKey) {
      handleRestError(
        new ErrorWithCode("`Invite admin` needs admin_invite_key.", 400),
        req.route,
        res,
      )

      return
    }
    if (typeof adminInviteKey !== "string") {
      handleRestError(
        new ErrorWithCode("invalid parameter.", 400),
        req.route,
        res,
      )
      return
    }

    try {
      await roomService.inviteAdmin({
        id: req.params.id,
        adminInviteKey: adminInviteKey,
        adminId: req.body.adminId,
      })
      res.send({ result: "success", data: undefined })
    } catch (e) {
      handleRestError(e, req.route, res)
    }
  })

  const extractToken = (authHeader?: string): string | null => {
    if (!authHeader || !authHeader.startsWith("Bearer")) return null

    return authHeader.substring("Bearer ".length, authHeader.length)
  }
}
