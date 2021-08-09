import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { MessageStore } from "../../chatItem"

class Message extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    createdAt: Date,
    private readonly content: string,
    private readonly target: Message | Answer | null,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }

  public toChatItemStore(): MessageStore {
    const targetId = this.target ? this.target.id : null

    return {
      ...super.toChatItemStoreBase(),
      type: "message",
      content: this.content,
      target: targetId,
    }
  }
}

export default Message
