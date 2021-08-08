import Message from "./Message"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"
import { ReactionStore } from "../../chatItem"

class Reaction extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    timestamp: number,
    createdAt: Date,
    private readonly target: Message | Question | Answer,
  ) {
    super(id, topicId, roomId, userIconId, timestamp, createdAt)
  }

  public toChatItemStore(): ReactionStore {
    return {
      ...super.toChatItemStoreBase(),
      type: "reaction",
      target: this.target.id,
    }
  }
}

export default Reaction
