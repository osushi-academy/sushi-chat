import Question from "./Question";
import ChatItem from "./ChatItem";
import { AnswerStore } from "../../chatItem";

class Answer extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userId: string,
    timestamp: number,
    createdAt: Date,
    private readonly content: string,
    private readonly target: Question
  ) {
    super(id, topicId, roomId, userId, timestamp, createdAt);
  }

  public toChatItemStore(iconId: string): AnswerStore {
    return {
      ...super.toChatItemStoreBase(iconId),
      type: "answer",
      content: this.content,
      target: this.target.id,
    };
  }
}

export default Answer;
