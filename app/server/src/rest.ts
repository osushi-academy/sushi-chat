import express from "express"
import { v4 as uuid } from "uuid"
import RestRoomService from "./service/room/RestRoomService"

export const restSetup = (
  app: ReturnType<typeof express>,
  roomService: RestRoomService,
) => {
  app.get("/", (req, res) => res.send("ok"))

  // 新しくルームを作成する
  app.post("/room", (req, res) => {
    try {
      const roomId = uuid()

      const newRoom = roomService.build({
        id: roomId,
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
              adminInviteKey: newRoom.adminInviteKey
              */
          },
        ],
      })
    } catch (e) {
      res.status(400).send({
        result: "error",
        error: {
          code: 400,
          message: `${e.message ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
        },
      })
    }
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
          message: `${e.message ?? "Unknown error."} (USER_ROOM_HISTORY)`,
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
            message: `${e.message ?? "Unknown error."} (ADMIN_INVITE_ROOM)`,
          },
        })
      })
  })
}
