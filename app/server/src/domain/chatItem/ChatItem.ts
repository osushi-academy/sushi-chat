import { ChatItemBase, ChatItemStore } from "../../chatItem";

abstract class ChatItem {
  protected constructor(
    public readonly id: string,
    private readonly topicId: string,
    private readonly roomId: string,
    private readonly userId: string,
    private readonly timestamp: number,
    private readonly createdAt: Date
  ) {}

  // TODO: モデルオブジェクトに変換のメソッドを持たせるのではなく、変換するためのクラスを使った方が責務の分離として正しい
  public abstract toChatItemStore(iconId: string): ChatItemStore;

  // TODO: モデルオブジェクトに変換のメソッドを持たせるのではなく、変換するためのクラスを使った方が責務の分離として正しい
  protected toChatItemStoreBase(iconId: string): Omit<ChatItemBase, "type"> {
    return {
      id: this.id,
      topicId: this.topicId,
      iconId,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
    };
  }
}

export default ChatItem;
