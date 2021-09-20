import IconId from "../user/IconId"

abstract class ChatItem {
  protected constructor(
    public readonly id: string,
    public readonly topicId: string,
    public readonly roomId: string,
    public readonly userIconId: IconId,
    public readonly createdAt: Date,
    public readonly timestamp?: number,
  ) {}
}

export default ChatItem
