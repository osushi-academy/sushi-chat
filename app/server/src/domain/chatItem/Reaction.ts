import Message from "./Message";
import Question from "./Question";
import Answer from "./Answer";
import ChatItem from "./ChatItem";
import { ReactionStore } from "../../chatItem";

class Reaction extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userId: string,
    timestamp: number,
    createdAt: Date,
    private readonly target: Message | Question | Answer
  ) {
    super(id, topicId, roomId, userId, timestamp, createdAt);
  }

  public toChatItemStore(iconId: string): ReactionStore {
    return {
      ...super.toChatItemStoreBase(iconId),
      type: "reaction",
      target: this.target.id,
    };
  }
}

export default Reaction;
