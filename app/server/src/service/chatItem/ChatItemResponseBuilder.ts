import {
  ChatItem as ChatItemResponse,
  Answer as AnswerResponse,
  Message as MessageResponse,
  Question as QuestionResponse,
  Reaction as ReactionResponse,
} from "../../chatItem"
import Message from "../../domain/chatItem/Message"
import Answer from "../../domain/chatItem/Answer"
import Question from "../../domain/chatItem/Question"
import Reaction from "../../domain/chatItem/Reaction"
import ChatItem from "../../domain/chatItem/ChatItem"

class ChatItemResponseBuilder {
  public static buildChatItems(chatItems: ChatItem[]): ChatItemResponse[] {
    return chatItems.map((c) => {
      if (c instanceof Message) return this.buildMessage(c)
      if (c instanceof Reaction) return this.buildReaction(c)
      if (c instanceof Question) return this.buildQuestion(c)
      if (c instanceof Answer) return this.buildAnswer(c)

      throw new Error(`instance type of chatItem(id ${c.id}) is invalid.`)
    })
  }

  public static buildMessage(message: Message): MessageResponse {
    const t = message.target
    let target = null
    if (t instanceof Message) {
      target = this.buildMessage(t)
    } else if (t instanceof Answer) {
      target = this.buildAnswer(t)
    }

    return {
      id: message.id,
      topicId: message.topicId,
      type: "message",
      iconId: message.userIconId,
      createdAt: message.createdAt,
      timestamp: message.timestamp,
      target: target,
      content: message.content,
    }
  }

  public static buildReaction(reaction: Reaction): ReactionResponse {
    const t = reaction.target
    let target: MessageResponse | QuestionResponse | AnswerResponse
    if (t instanceof Message) {
      target = this.buildMessage(t)
    } else if (t instanceof Question) {
      target = this.buildQuestion(t)
    } else {
      target = this.buildAnswer(t)
    }

    return {
      id: reaction.id,
      topicId: reaction.topicId,
      type: "reaction",
      iconId: reaction.userIconId,
      createdAt: reaction.createdAt,
      timestamp: reaction.timestamp,
      target,
    }
  }

  public static buildQuestion(question: Question): QuestionResponse {
    return {
      id: question.id,
      topicId: question.topicId,
      type: "question",
      iconId: question.userIconId,
      createdAt: question.createdAt,
      timestamp: question.timestamp,
      content: question.content,
    }
  }

  public static buildAnswer(answer: Answer): AnswerResponse {
    const target = this.buildQuestion(answer.target)

    return {
      id: answer.id,
      topicId: answer.topicId,
      type: "answer",
      iconId: answer.userIconId,
      createdAt: answer.createdAt,
      timestamp: answer.timestamp,
      target,
      content: answer.content,
    }
  }
}

export default ChatItemResponseBuilder
