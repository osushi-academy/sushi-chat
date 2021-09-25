import Message from "./Message"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../user/User"

class Reaction extends ChatItem {
  constructor(
    id: string,
    topicId: number,
    user: User,
    senderType: ChatItemSenderType,
    public readonly quote: Message | Question | Answer,
    createdAt: Date,
    timestamp?: number,
  ) {
    super(id, topicId, user, senderType, createdAt, timestamp)
  }
}

export default Reaction
