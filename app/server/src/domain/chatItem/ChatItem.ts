import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../user/User"

abstract class ChatItem {
  protected constructor(
    public readonly id: string,
    public readonly topicId: number,
    public readonly user: User,
    public readonly senderType: ChatItemSenderType,
    public readonly createdAt: Date,
    public readonly timestamp?: number,
    public readonly isPinned = false,
  ) {}
}

export default ChatItem
