import Question from "./Question"
import ChatItem from "./ChatItem"
import { AnswerStore } from "../../chatItem"

class Answer extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    createdAt: Date,
    public readonly content: string,
    public readonly target: Question,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }

  public toChatItemStore(): AnswerStore {
    return {
      ...super.toChatItemStoreBase(),
      type: "answer",
      content: this.content,
      target: this.target.id,
    }
  }
}

export default Answer
