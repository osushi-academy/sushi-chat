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
            /*
              startDate: newRoom.startDate,
              adminInviteKey: newRoom.adminInviteKey
              */
          },
        ],
      })
    } catch (e) {
      res.send({
        result: "error",
        error: {
          code: 400,
          message: `${e.message ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
        },
      })
    }
  })

  // ルームと新しい管理者を紐付ける
  app.post("/room/:id/invite", (req, res) => {
    roomService
      .inviteAdmin({
        id: req.params.id,
        adminInviteKey: req.body.adminInviteKey,
        adminId: "should get from header",
      })
      .then(() => res.send({ result: "success" }))
      .catch((e) => {
        res.send({
          result: "error",
          error: {
            code: 400,
            message: `${e.message ?? "Unknown error."} (ADMIN_INVITE_ROOM)`,
          },
        })
      })
  })
}
