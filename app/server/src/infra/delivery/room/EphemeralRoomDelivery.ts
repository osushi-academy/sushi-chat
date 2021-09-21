import IRoomDelivery from "../../../domain/room/IRoomDelivery"
import Topic from "../../../domain/room/Topic"

export type DeliveryType = "START" | "CLOSE" | "FINISH" | "CHANGE_TOPIC_STATE"

class EphemeralRoomDelivery implements IRoomDelivery {
  constructor(
    private readonly _subscribers: {
      type: DeliveryType
      content: Record<string, unknown>
    }[][],
  ) {}

  public get subscribers() {
    return [...this._subscribers.map((s) => [...s])]
  }

  public changeTopicState(roomId: string, topic: Topic) {
    this._subscribers.forEach((s) =>
      s.push({
        type: "CHANGE_TOPIC_STATE",
        content: { roomId, topic },
      }),
    )
  }
}

export default EphemeralRoomDelivery
