import IChatItemDelivery from "../../../domain/chatItem/IChatItemDelivery"
import Answer from "../../../domain/chatItem/Answer"
import Message from "../../../domain/chatItem/Message"
import Question from "../../../domain/chatItem/Question"
import Reaction from "../../../domain/chatItem/Reaction"
import ChatItem from "../../../domain/chatItem/ChatItem"

class EphemeralChatItemDelivery implements IChatItemDelivery {
  constructor(private readonly _subscribers: ChatItem[][]) {}

  public get subscribers() {
    return [...this._subscribers.map((s) => [...s])]
  }

  public postMessage(message: Message): void {
    this._subscribers.forEach((s) => s.push(message))
  }

  public postReaction(reaction: Reaction): void {
    this._subscribers.forEach((s) => s.push(reaction))
  }

  public postQuestion(question: Question): void {
    this._subscribers.forEach((s) => s.push(question))
  }

  public postAnswer(answer: Answer): void {
    this._subscribers.forEach((s) => s.push(answer))
  }
}

export default EphemeralChatItemDelivery
