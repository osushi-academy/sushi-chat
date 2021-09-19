import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import IconId from "../user/IconId"

class Question extends ChatItem {
  constructor(
    id: string,
    roomId: string,
    topicId: number,
    iconId: IconId,
    senderType: ChatItemSenderType,
    public readonly content: string,
    createdAt: Date,
    timestamp?: number,
  ) {
    super(id, roomId, topicId, iconId, senderType, createdAt, timestamp)
  }
}

export default Question
