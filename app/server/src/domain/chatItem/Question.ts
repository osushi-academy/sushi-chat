import ChatItem from "./ChatItem"
import { QuestionStore } from "../../chatItem"

class Question extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    createdAt: Date,
    public readonly content: string,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
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
