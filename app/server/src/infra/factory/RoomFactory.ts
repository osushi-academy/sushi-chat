import { v4 as uuid } from "uuid"
import IRoomFactory from "../../domain/room/IRoomFactory"
import Topic from "../../domain/room/Topic"
import RoomClass from "../../domain/room/Room"

class RoomFactory implements IRoomFactory {
  public create(
    title: string,
    topics: Omit<Topic, "id" | "state">[],
    description?: string,
  ): RoomClass {
    const roomId = uuid()
    const inviteKey = uuid()

    return new RoomClass(roomId, title, description ?? "", inviteKey, topics)
  }
}

export default RoomFactory
