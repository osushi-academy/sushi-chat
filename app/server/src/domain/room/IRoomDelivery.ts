import Topic from "./Topic"

interface IRoomDelivery {
  changeTopicState(roomId: string, topic: Topic): void
}

export default IRoomDelivery
