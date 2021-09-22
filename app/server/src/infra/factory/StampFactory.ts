import { v4 as uuid } from "uuid"
import Stamp from "../../domain/stamp/Stamp"

class StampFactory {
  public create(
    userId: string,
    roomId: string,
    topicId: number,
    timestamp: number,
  ): Stamp {
    const id = uuid()
    const createdAt = new Date()

    return new Stamp(id, userId, roomId, topicId, createdAt, timestamp)
  }
}

export default StampFactory
