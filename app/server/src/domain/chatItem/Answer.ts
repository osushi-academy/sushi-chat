import Question from "./Question"
import ChatItem from "./ChatItem"
import { AnswerStore } from "../../chatItem"

class Answer extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: string,
    timestamp: number,
    createdAt: Date,
    private readonly content: string,
    private readonly target: Question,
  ) {
    super(id, topicId, roomId, userIconId, timestamp, createdAt)
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
