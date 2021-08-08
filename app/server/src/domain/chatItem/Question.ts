import ChatItem from "./ChatItem"
import { QuestionStore } from "../../chatItem"

class Question extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    timestamp: number,
    createdAt: Date,
    private readonly content: string,
  ) {
    super(id, topicId, roomId, userIconId, timestamp, createdAt)
  }

  public toChatItemStore(): QuestionStore {
    return {
      ...super.toChatItemStoreBase(),
      type: "question",
      content: this.content,
    }
  }
}

export default Question
