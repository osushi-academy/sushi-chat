import Answer from "./Answer";
import ChatItem from "./ChatItem";
import { ChatItemStore, ChatItemType, MessageStore } from "../../chatItem";

class Message extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userId: string,
    timestamp: number,
    createdAt: Date,
    private readonly content: string,
    private readonly target: Message | Answer | null
  ) {
    super(id, topicId, roomId, userId, timestamp, createdAt);
  }

  public toChatItemStore(iconId: string): MessageStore {
    const targetId = this.target ? this.target.id : null;

    return {
      ...super.toChatItemStoreBase(iconId),
      type: "message",
      content: this.content,
      target: targetId,
    };
  }
}

export default Message;
