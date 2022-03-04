import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import ChatItem from "../../../domain/chatItem/ChatItem"
import Answer from "../../../domain/chatItem/Answer"
import Message from "../../../domain/chatItem/Message"
import Question from "../../../domain/chatItem/Question"
import Reaction from "../../../domain/chatItem/Reaction"

class EphemeralChatItemRepository implements IChatItemRepository {
  private chatItems: ChatItem[] = []

  public find(chatItemId: string) {
    return Promise.resolve(
      this.chatItems.find((c) => c.id === chatItemId) ?? null,
    )
  }

  public saveAnswer(answer: Answer) {
    this.chatItems.push(answer)
  }

  public saveMessage(message: Message) {
    this.chatItems.push(message)
  }

  public saveQuestion(question: Question) {
    this.chatItems.push(question)
  }

  public saveReaction(reaction: Reaction) {
    this.chatItems.push(reaction)
  }

  public async selectByRoomId(roomId: string) {
    return Promise.resolve(
      this.chatItems.filter((c) => c.user.roomId === roomId),
    )
  }

  public selectByRoomIds(
    roomIds: string[],
  ): Promise<Record<string, ChatItem[]>> {
    return Promise.resolve(
      roomIds.reduce<Record<string, ChatItem[]>>((acc, cur) => {
        acc[cur] = this.chatItems.filter((c) => c.user.roomId === cur)
        return acc
      }, {}),
    )
  }

  public pinChatItem(chatItem: ChatItem) {
    this.chatItems = this.chatItems.filter((c) => c.id !== chatItem.id)

    let pinned: ChatItem

    if (chatItem instanceof Message) {
      pinned = new Message(
        chatItem.id,
        chatItem.topicId,
        chatItem.user,
        chatItem.senderType,
        chatItem.content,
        chatItem.quote,
        chatItem.createdAt,
        chatItem.timestamp,
        true,
      )
    } else if (chatItem instanceof Reaction) {
      pinned = new Reaction(
        chatItem.id,
        chatItem.topicId,
        chatItem.user,
        chatItem.senderType,
        chatItem.quote,
        chatItem.createdAt,
        chatItem.timestamp,
        true,
      )
    } else if (chatItem instanceof Question) {
      pinned = new Question(
        chatItem.id,
        chatItem.topicId,
        chatItem.user,
        chatItem.senderType,
        chatItem.content,
        chatItem.quote,
        chatItem.createdAt,
        chatItem.timestamp,
        true,
      )
    } else if (chatItem instanceof Answer) {
      pinned = new Answer(
        chatItem.id,
        chatItem.topicId,
        chatItem.user,
        chatItem.senderType,
        chatItem.content,
        chatItem.quote,
        chatItem.createdAt,
        chatItem.timestamp,
        true,
      )
    } else {
      throw new Error(`ChatItem(${chatItem.id}) instance type is invalid.`)
    }

    this.chatItems.push(pinned)
  }
}

export default EphemeralChatItemRepository
