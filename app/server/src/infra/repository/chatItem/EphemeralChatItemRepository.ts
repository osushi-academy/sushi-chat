import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import ChatItem from "../../../domain/chatItem/ChatItem"
import Answer from "../../../domain/chatItem/Answer"
import Message from "../../../domain/chatItem/Message"
import Question from "../../../domain/chatItem/Question"
import Reaction from "../../../domain/chatItem/Reaction"

class EphemeralChatItemRepository implements IChatItemRepository {
  private readonly chatItems: Record<string, ChatItem> = {}

  public find(chatItemId: string) {
    return Promise.resolve(this.chatItems[chatItemId])
  }

  public saveAnswer(answer: Answer) {
    this.chatItems[answer.id] = answer
  }

  public saveMessage(message: Message) {
    this.chatItems[message.id] = message
  }

  public saveQuestion(question: Question) {
    this.chatItems[question.id] = question
  }

  public saveReaction(reaction: Reaction) {
    this.chatItems[reaction.id] = reaction
  }

  public async selectByRoomId(roomId: string) {
    return Promise.resolve(
      Object.values(this.chatItems).filter((c) => c.user.roomId === roomId),
    )
  }

  public pinChatItem(chatItem: ChatItem) {
    throw new Error("Not implemented")
  }
}

export default EphemeralChatItemRepository
