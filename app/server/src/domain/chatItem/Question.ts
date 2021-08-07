import ChatItem from "./ChatItem";
import { QuestionStore } from "../../chatItem";

class Question extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userId: string,
    timestamp: number,
    createdAt: Date,
    private readonly content: string
  ) {
    super(id, topicId, roomId, userId, timestamp, createdAt);
  }

  public toChatItemStore(iconId: string): QuestionStore {
    return {
      ...super.toChatItemStoreBase(iconId),
      type: "question",
      content: this.content,
    };
  }
}

export default Question;
