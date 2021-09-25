import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../user/User"

class Message extends ChatItem {
  constructor(
    id: string,
    topicId: number,
    user: User,
    senderType: ChatItemSenderType,
    public readonly content: string,
    public readonly quote: Message | Answer | null,
    createdAt: Date,
    timestamp?: number,
  ) {
    super(id, topicId, user, senderType, createdAt, timestamp)
  }
}

export default Message
