import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../user/User"
import Message from "./Message"
import Answer from "./Answer"

class Question extends ChatItem {
  constructor(
    id: string,
    topicId: number,
    user: User,
    senderType: ChatItemSenderType,
    public readonly content: string,
    public readonly quote: Message | Answer | null,
    createdAt: Date,
    timestamp?: number,
    isPinned = false,
  ) {
    super(id, topicId, user, senderType, createdAt, timestamp, isPinned)
  }
}

export default Question
