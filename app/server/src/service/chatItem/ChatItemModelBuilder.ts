import Message from "../../domain/chatItem/Message"
import Answer from "../../domain/chatItem/Answer"
import Question from "../../domain/chatItem/Question"
import Reaction from "../../domain/chatItem/Reaction"
import ChatItem from "../../domain/chatItem/ChatItem"
import { ChatItemModel } from "sushi-chat-shared"

class ChatItemModelBuilder {
  public static buildChatItems(chatItems: ChatItem[]): ChatItemModel[] {
    return chatItems.map((c) => {
      if (c instanceof Message) return this.buildMessage(c)
      if (c instanceof Reaction) return this.buildReaction(c)
      if (c instanceof Question) return this.buildQuestion(c)
      if (c instanceof Answer) return this.buildAnswer(c)

      throw new Error(`instance type of chatItem(id ${c.id}) is invalid.`)
    })
  }

  // NOTE: フロントに渡すchatItemは、rootのchatItemのquoteまで作ればよい。それより深いquoteは見られない
  public static buildMessage(
    message: Message,
    recursive = true,
  ): ChatItemModel {
    const quote = message.quote
    const quoteModel = !recursive
      ? undefined
      : quote instanceof Message
      ? this.buildMessage(quote, false)
      : quote instanceof Answer
      ? this.buildAnswer(quote, false)
      : undefined

    return {
      id: message.id,
      topicId: message.topicId,
      createdAt: message.createdAt.toISOString(),
      type: "message",
      senderType: message.senderType,
      iconId: message.user.iconId.valueOf(),
      content: message.content,
      quote: quoteModel,
      timestamp: message.timestamp,
    }
  }

  // NOTE: フロントに渡すchatItemは、rootのchatItemのquoteまで作ればよい。それより深いquoteは見られない
  public static buildReaction(
    reaction: Reaction,
    recursive = true,
  ): ChatItemModel {
    const quote = reaction.quote
    const quoteModel = !recursive
      ? undefined
      : quote instanceof Message
      ? this.buildMessage(quote, false)
      : quote instanceof Question
      ? this.buildQuestion(quote)
      : this.buildAnswer(quote, false)

    return {
      id: reaction.id,
      topicId: reaction.topicId,
      createdAt: reaction.createdAt.toISOString(),
      type: "reaction",
      senderType: reaction.senderType,
      iconId: reaction.user.iconId.valueOf(),
      quote: quoteModel,
      timestamp: reaction.timestamp,
    }
  }

  public static buildQuestion(
    question: Question,
    recursive = true,
  ): ChatItemModel {
    const quote = question.quote
    const quoteModel =
      !recursive || quote == null
        ? undefined
        : quote instanceof Message
        ? this.buildMessage(quote, false)
        : this.buildAnswer(quote, false)

    return {
      id: question.id,
      topicId: question.topicId,
      createdAt: question.createdAt.toISOString(),
      type: "question",
      senderType: question.senderType,
      iconId: question.user.iconId.valueOf(),
      content: question.content,
      quote: quoteModel,
      timestamp: question.timestamp,
    }
  }

  // NOTE: フロントに渡すchatItemは、rootのchatItemのquoteまで作ればよい。それより深いquoteは見られない
  public static buildAnswer(answer: Answer, recursive = true): ChatItemModel {
    return {
      id: answer.id,
      topicId: answer.topicId,
      createdAt: answer.createdAt.toISOString(),
      type: "answer",
      senderType: answer.senderType,
      iconId: answer.user.iconId.valueOf(),
      content: answer.content,
      quote: !recursive ? undefined : this.buildQuestion(answer.quote),
      timestamp: answer.timestamp,
    }
  }
}

export default ChatItemModelBuilder
