import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../user/User"

class Question extends ChatItem {
  constructor(
    id: string,
    topicId: number,
    user: User,
    senderType: ChatItemSenderType,
    public readonly content: string,
    createdAt: Date,
    timestamp?: number,
    isPinned = false,
  ) {
    super(id, topicId, user, senderType, createdAt, timestamp, isPinned)
  }
}

export default Question
