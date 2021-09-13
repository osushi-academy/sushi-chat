import express from "express"
import { v4 as uuid } from "uuid"
import RestRoomService from "./service/room/RestRoomService"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"

export const restSetup = (app: ReturnType<typeof express>) => {
  app.get("/", (req, res) => res.send("ok"))

  // 新しくルームを作成する
  app.post("/room", (req, res) => {
    buildRoom(req, res)
  })
}

export const buildRoom = (req: express.Request, res: express.Response) => {
  const userRepository = LocalMemoryUserRepository.getInstance()
  const chatItemRepository = new ChatItemRepository()
  const stampRepository = new StampRepository()
  try {
    const roomId = uuid()
    const roomService = new RestRoomService(
      new RoomRepository(userRepository, chatItemRepository, stampRepository),
      userRepository,
    )

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
          /* state: newRoom.state,
          startDate: newRoom.startDate,
          adminInviteKey: newRoom.adminInviteKey,
          isArchived: newRoom.isArchived, */
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
}
