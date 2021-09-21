import express from "express"
import RestRoomService from "./service/room/RestRoomService"

export const restSetup = (
  app: ReturnType<typeof express>,
  roomService: RestRoomService,
) => {
  app.get("/", (req, res) => res.send("ok"))

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
        room: [
          {
            id: newRoom.id,
            title: newRoom.title,
            description: newRoom.description,
            topics: newRoom.topics,
            state: newRoom.state,
            adminInviteKey: newRoom.adminInviteKey,
            /*
              startDate: newRoom.startDate,
              */
          },
        ],
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

  // ルームを公開停止にする
  app.put("/room/:id/archive", (req, res) => {
    // TODO:adminIdをheaderから取得
    const adminId = ""
    roomService
      .archive({
        id: req.params.id,
        adminId: adminId,
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
          code: 400,
          message: `${e.message ?? "Unknown error."} (USER_FIND_ROOM)`,
        },
      })
    }
  })

  // ルームと新しい管理者を紐付ける
  app.post("/room/:id/invite", (req, res) => {
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
        adminId: "should get from header",
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
}
