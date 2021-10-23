import Question from "./Question"
import ChatItem from "./ChatItem"
import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../user/User"

class Answer extends ChatItem {
  constructor(
    id: string,
    topicId: number,
    user: User,
    senderType: ChatItemSenderType,
    public readonly content: string,
    // FIXME: quoteとしてインスタンスかされる際にnullにしたいので暫定的にこうしている。
    //  仕様的にはAnswerのquoteがないことはあり得ないので、ChatItemがquoteIdのみを持つようにするなどの修正をする必要あり。
    public readonly quote: Question | null,
    createdAt: Date,
    timestamp?: number,
    isPinned = false,
  ) {
    super(id, topicId, user, senderType, createdAt, timestamp, isPinned)
  }
}

export default Answer
