import IStampFactory from "../../domain/stamp/IStampFactory"
import Stamp from "../../domain/stamp/Stamp"

class StampFactory implements IStampFactory {
  public create(
    id: string,
    userId: string,
    roomId: string,
    topicId: number,
    timestamp: number,
  ): Stamp {
    const createdAt = new Date()

    return new Stamp(id, userId, roomId, topicId, createdAt, timestamp)
  }
}

export default StampFactory
