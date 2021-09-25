import IRoomDelivery from "../../../domain/room/IRoomDelivery"
import { GlobalSocket } from "../../../ioServer"
import Topic from "../../../domain/room/Topic"

class RoomDelivery implements IRoomDelivery {
  constructor(private readonly globalSocket: GlobalSocket) {}

  public changeTopicState(roomId: string, topic: Topic): void {
    this.globalSocket
      .to(roomId)
      .emit("PUB_CHANGE_TOPIC_STATE", { state: topic.state, topicId: topic.id })
  }
}

export default RoomDelivery
