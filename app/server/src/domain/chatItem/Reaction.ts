import Message from "./Message"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"

class Reaction extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    createdAt: Date,
    public readonly target: Message | Question | Answer,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }
}

export default Reaction
