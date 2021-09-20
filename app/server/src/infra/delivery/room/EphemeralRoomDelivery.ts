import IRoomDelivery from "../../../domain/room/IRoomDelivery"
import { ChangeTopicStateType } from "../../../events"

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

  public start(roomId: string): void {
    this._subscribers.forEach((s) =>
      s.push({ type: "START", content: { roomId } }),
    )
  }

  public close(roomId: string): void {
    this._subscribers.forEach((s) =>
      s.push({ type: "CLOSE", content: { roomId } }),
    )
  }

  public finish(roomId: string): void {
    this._subscribers.forEach((s) =>
      s.push({ type: "FINISH", content: { roomId } }),
    )
  }

  public changeTopicState(
    type: ChangeTopicStateType,
    roomId: string,
    topicId: string,
  ): void {
    this._subscribers.forEach((s) =>
      s.push({
        type: "CHANGE_TOPIC_STATE",
        content: { type, roomId, topicId },
      }),
    )
  }
}

export default EphemeralRoomDelivery
