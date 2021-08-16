import Message from "./Message"
import Reaction from "./Reaction"
import Question from "./Question"
import Answer from "./Answer"

interface IChatItemDelivery {
  postMessage(message: Message): void
  postReaction(reaction: Reaction): void
  postQuestion(question: Question): void
  postAnswer(answer: Answer): void
}

export default IChatItemDelivery
