import { v4 as uuid } from "uuid"
import RestRoomService from "./service/room/RestRoomService"
import LocalMemoryUserRepository from "./infra/repository/User/LocalMemoryUserRepository"
import ChatItemRepository from "./infra/repository/chatItem/ChatItemRepository"
import StampRepository from "./infra/repository/stamp/StampRepository"
import RoomRepository from "./infra/repository/room/RoomRepository"
import Topic from "./domain/room/Topic"

// TODO:古い型に合わせる用。本来は不要。
type NewTopic = {
  title: string
}

// TODO:古い型に合わせる用。本来は不要。
const topicToOld = (t: NewTopic) => {
  return { ...t, urls: {} }
}

export const buildRoom = (req, res) => {
  const userRepository = LocalMemoryUserRepository.getInstance()
  const chatItemRepository = new ChatItemRepository()
  const stampRepository = new StampRepository()
  try {
    const roomId = uuid()
    const roomService = new RestRoomService(
      new RoomRepository(userRepository, chatItemRepository, stampRepository),
      userRepository,
    )

    // TODO:古い型に合わせる用。本来は不要。
    const newTopics = req.body.topics.map((topic: NewTopic) =>
      topicToOld(topic),
    )

    const newRoom = roomService.build({
      id: roomId,
      title: req.body.title,
      topics: newTopics /* TODO:古い型に合わせる用。本来は req.body.topics */,
    })

    res.send({
      result: "success",
      data: [
        {
          id: newRoom.id,
          title: newRoom.title,
          topics: newRoom.topics,
        },
      ],
    })
  } catch (e) {
    console.error(
      `${e.message ?? "Unknown error."} (ADMIN_BUILD_ROOM)`,
      new Date().toISOString(),
    )
    res.send(`${e.message ?? "Unknown error."} (ADMIN_BUILD_ROOM)`)
  }
}
