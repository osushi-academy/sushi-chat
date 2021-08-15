import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import ChatItem from "../../../domain/chatItem/ChatItem"
import Answer from "../../../domain/chatItem/Answer"
import Message from "../../../domain/chatItem/Message"
import Question from "../../../domain/chatItem/Question"
import Reaction from "../../../domain/chatItem/Reaction"

class EphemeralChatItemRepository implements IChatItemRepository {
  private readonly chatItems: Record<string, ChatItem> = {}

  public find(chatItemId: string): Promise<ChatItem> {
    return Promise.resolve(this.chatItems[chatItemId])
  }

  public saveAnswer(answer: Answer): void {
    this.chatItems[answer.id] = answer
  }

  public saveMessage(message: Message): void {
    this.chatItems[message.id] = message
  }

  public saveQuestion(question: Question): void {
    this.chatItems[question.id] = question
  }

  public saveReaction(reaction: Reaction): void {
    this.chatItems[reaction.id] = reaction
  }
}

export default EphemeralChatItemRepository
