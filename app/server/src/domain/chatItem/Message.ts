import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { ChatItemSenderType, MAX_MESSAGE_LENGTH } from "sushi-chat-shared"
import User from "../user/User"
import split from "graphemesplit"

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
    isPinned = false,
  ) {
    super(id, topicId, user, senderType, createdAt, timestamp, isPinned)
    // バリデーション
    // ルームタイトル
    if (split(this.content).length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message(id: ${this.id}) content length(${this.content}}) is too long.`,
      )
    }
  }
}

export default Message
