import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { ChatItemSenderType, MAX_MESSAGE_LENGTH } from "sushi-chat-shared"
import User from "../user/User"
import unicodeLength from "unicode-length"

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
    if (unicodeLength.get(this.content) > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message content length(${this.content}}) is too long.`)
    }
  }
}

export default Message
