import { ChatItemSenderType } from "sushi-chat-shared"
import IconId from "../user/IconId"

abstract class ChatItem {
  protected constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly topicId: number,
    public readonly iconId: IconId,
    public readonly senderType: ChatItemSenderType,
    public readonly createdAt: Date,
    public readonly timestamp?: number,
    public readonly isPinned = false,
  ) {}
}

export default ChatItem
