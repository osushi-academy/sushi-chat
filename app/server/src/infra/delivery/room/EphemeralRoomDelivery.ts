import IRoomDelivery from "../../../domain/room/IRoomDelivery"
import Topic from "../../../domain/room/Topic"

export type DeliveryType = "START" | "CLOSE" | "FINISH" | "CHANGE_TOPIC_STATE"
export type ChangeTopicStateContent = { roomId: string; topic: Topic }

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
    const delivered: { type: DeliveryType; content: ChangeTopicStateContent } =
      {
        type: "CHANGE_TOPIC_STATE",
        content: { roomId, topic },
      }
    this._subscribers.forEach((s) => s.push(delivered))
  }
}

export default EphemeralRoomDelivery
