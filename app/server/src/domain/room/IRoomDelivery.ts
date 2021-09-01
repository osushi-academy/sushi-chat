import { ChangeTopicStateType } from "../../events"

interface IRoomDelivery {
  start(roomId: string): void
  finish(roomId: string): void
  close(roomId: string): void
  changeTopicState(
    type: ChangeTopicStateType,
    roomId: string,
    topicId: string,
  ): void
}

export default IRoomDelivery
