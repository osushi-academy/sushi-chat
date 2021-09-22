import Stamp from "../../domain/stamp/Stamp"
import { StampModel } from "sushi-chat-shared"

class StampModelBuilder {
  public static buildStamps(stamps: Stamp[]): StampModel[] {
    return stamps.map(this.buildStamp)
  }

  public static buildStamp(stamp: Stamp): StampModel {
    return {
      id: stamp.id,
      topicId: stamp.topicId,
      timestamp: stamp.timestamp,
      createdAt: stamp.createdAt.toISOString(),
    }
  }
}

export default StampModelBuilder
