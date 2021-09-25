import Message from "./Message"
import Reaction from "./Reaction"
import Question from "./Question"
import Answer from "./Answer"
import ChatItem from "./ChatItem"

interface IChatItemDelivery {
  postMessage(message: Message): void
  postReaction(reaction: Reaction): void
  postQuestion(question: Question): void
  postAnswer(answer: Answer): void
  pinChatItem(chatItem: ChatItem): void
}

export default IChatItemDelivery
