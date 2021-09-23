import express, { Response } from "express"
import AdminService from "./service/admin/AdminService"
import RestRoomService from "./service/room/RestRoomService"

export const restSetup = (
  app: ReturnType<typeof express>,
  roomService: RestRoomService,
  adminService: AdminService,
) => {
  // For health check
  app.get("/", (req, res) => res.send("ok"))

  // チャット履歴・スタンプ履歴を取得する
  app.get("/room/:id/history", async (req, res) => {
    try {
      const room = await roomService.find(req.params.id)

      res.send({
        result: "success",
        data: {
          chatItems: room.chatItems,
          stamps: room.stamps,
          pinnedChatItemIds: room.pinnedChatItemIds,
        },
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `${e ?? "Unknown error."} (USER_ROOM_HISTORY)`,
        },
      })
    }
  })

  // ルーム情報を取得する
  app.get("/room/:id", async (req, res) => {
    try {
      const room = await roomService.checkAdminAndfind({
        id: req.params.id,
        adminId: req.body.adminId,
      })

      res.send({
        result: "success",
        data: room,
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `${e.message ?? "Unknown error."} (USER_FIND_ROOM)`,
        },
      })
    }
  })

  // adminの認証/認可が必要なエンドポイントのルーター
  const adminRouter = express.Router()
  app.use("/", adminRouter)

  // AuthorizationヘッダからidTokenをextractし、検証結果をbodyに入れる
  adminRouter.use(async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).send({
        result: "error",
        error: {
          code: 404,
          message:
            "Must specify authorization ID token; e.g. Authorization: Bearer <id token>",
        },
      })

      return
    }

    // TODO:bodyがanyで入れるの簡単だったので入れてるが、本当は専用のフィールドに入れたい
    const token = authHeader.substring("Bearer ".length, authHeader.length)
    try {
      const adminId = await adminService.verifyToken(token)
      req.body.adminId = adminId
    } catch (e) {
      handleError(e, req.route, res)
      return
    }

    next()
  })

  // 管理しているルーム一覧を取得する
  adminRouter.get("/room", async (req, res) => {
    try {
      const rooms = await adminService.getManagedRooms({
        adminId: req.body.adminId,
      })

      res.send({
        result: "success",
        room: rooms.map((room) => {
          return {
            id: room.id,
            title: room.title,
            description: room.description,
            topics: room.topics,
            state: room.state,
            adminInviteKey: room.adminInviteKey,
            /*
              startDate: newRoom.startDate
              */
          }
        }),
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `${e ?? "Unknown error."} (ADMIN_GET_ROOMS)`,
        },
      })
    }
  })

  // 新しくルームを作成する
  adminRouter.post("/room", async (req, res) => {
    try {
      const newRoom = await roomService.build({
        title: req.body.title,
        topics: req.body.topics,
        description: req.body.description,
        adminId: req.body.adminId,
      })
      res.send({
        result: "success",
        data: {
          id: newRoom.id,
          title: newRoom.title,
          description: newRoom.description,
          topics: newRoom.topics,
          state: newRoom.state,
          adminInviteKey: newRoom.adminInviteKey,
          startDate: null,
        },
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `${e ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
        },
      })
    }
  })

  // ルームを開始する
  adminRouter.put("/room/:id/start", (req, res) => {
    roomService
      .start({
        id: req.params.id,
        adminId: req.body.adminId,
      })
      .then(() => res.send({ result: "success" }))
      .catch((e) => {
        res.status(400).send({
          result: "error",
          error: {
            code: 400,
            message: `${e.message ?? "Unknown error."} (ADMIN_START_ROOM)`,
          },
        })
      })
  })

  // ルームを公開停止にする
  adminRouter.put("/room/:id/archive", (req, res) => {
    roomService
      .archive({
        id: req.params.id,
        adminId: req.body.adminId,
      })
      .then(() => res.send({ result: "success" }))
      .catch((e) => {
        res.status(400).send({
          result: "error",
          error: {
            code: 400,
            message: `${e ?? "Unknown error."} (ADMIN_ARCHIVE_ROOM)`,
          },
        })
      })
  })

  // ルームと新しい管理者を紐付ける
  adminRouter.post("/room/:id/invite", (req, res) => {
    const adminInviteKey = req.query["admin_invite_key"]
    if (!adminInviteKey) {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `invite admin needs admin_invite_key. (ADMIN_INVITE_ROOM)`,
        },
      })
      return
    }
    if (typeof adminInviteKey !== "string") {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `invaild parameter. (ADMIN_INVITE_ROOM)`,
        },
      })
      return
    }
    roomService
      .inviteAdmin({
        id: req.params.id,
        adminInviteKey: adminInviteKey,
        adminId: req.body.adminId,
      })
      .then(() => res.send({ result: "success" }))
      .catch((e) => {
        res.status(400).send({
          result: "error",
          error: {
            code: 400,
            message: `${e ?? "Unknown error."} (ADMIN_INVITE_ROOM)`,
          },
        })
      })
  })

  const handleError = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    route: string,
    res: Response,
    code = 500,
  ) => {
    logError(route, error)
    res.status(code).send({
      result: "error",
      error: { code, message: `${error ?? "Unknown error."}(${route})` },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logError = (context: string, error: any) => {
    const date = new Date().toISOString()
    console.error(`[${date}]${context}:${error ?? "Unknown error."}`)
  }
}
