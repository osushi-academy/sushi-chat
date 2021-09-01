import Answer from "./Answer"
import ChatItem from "./ChatItem"

class Message extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    createdAt: Date,
    public readonly content: string,
    public readonly target: Message | Answer | null,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }
}

export default Message
