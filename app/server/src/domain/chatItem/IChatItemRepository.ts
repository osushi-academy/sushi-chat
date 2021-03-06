import Message from "./Message"
import Reaction from "./Reaction"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"

interface IChatItemRepository {
  saveMessage(message: Message): void
  saveReaction(reaction: Reaction): void
  saveQuestion(question: Question): void
  saveAnswer(answer: Answer): void
  find(chatItemId: string): Promise<ChatItem | null>
  selectByRoomId(roomId: string): Promise<ChatItem[]>
  pinChatItem(chatItem: ChatItem): void
}

export default IChatItemRepository
