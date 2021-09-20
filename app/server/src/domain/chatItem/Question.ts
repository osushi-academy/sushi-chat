import ChatItem from "./ChatItem"
import IconId from "../user/IconId"

class Question extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: IconId,
    createdAt: Date,
    public readonly content: string,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }
}

export default Question
