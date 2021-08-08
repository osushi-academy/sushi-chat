import { ChatItemBase, ChatItemStore } from "../../chatItem"

abstract class ChatItem {
  protected constructor(
    public readonly id: string,
    private readonly topicId: string,
    public readonly roomId: string,
    private readonly userIconId: string,
    private readonly timestamp: number,
    private readonly createdAt: Date,
  ) {}

  // TODO: モデルオブジェクトに変換のメソッドを持たせるのではなく、変換するためのクラスを使った方が責務の分離として正しい
  public abstract toChatItemStore(): ChatItemStore

  // TODO: モデルオブジェクトに変換のメソッドを持たせるのではなく、変換するためのクラスを使った方が責務の分離として正しい
  protected toChatItemStoreBase(): Omit<ChatItemBase, "type"> {
    return {
      id: this.id,
      topicId: this.topicId,
      iconId: this.userIconId,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
    }
  }
}

export default ChatItem
