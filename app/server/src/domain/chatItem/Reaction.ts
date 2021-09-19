import Message from "./Message"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"
import IconId from "../user/IconId"

class Reaction extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: IconId,
    createdAt: Date,
    public readonly target: Message | Question | Answer,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }
}

export default Reaction
