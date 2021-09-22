import Message from "./Message"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import IconId from "../user/IconId"

class Reaction extends ChatItem {
  constructor(
    id: string,
    roomId: string,
    topicId: number,
    iconId: IconId,
    senderType: ChatItemSenderType,
    public readonly quote: Message | Question | Answer,
    createdAt: Date,
    timestamp?: number,
  ) {
    super(id, roomId, topicId, iconId, senderType, createdAt, timestamp)
  }
}

export default Reaction
