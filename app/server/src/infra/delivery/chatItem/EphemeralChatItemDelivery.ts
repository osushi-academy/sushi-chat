import IChatItemDelivery from "../../../domain/chatItem/IChatItemDelivery"
import Answer from "../../../domain/chatItem/Answer"
import Message from "../../../domain/chatItem/Message"
import Question from "../../../domain/chatItem/Question"
import Reaction from "../../../domain/chatItem/Reaction"
import ChatItem from "../../../domain/chatItem/ChatItem"

class EphemeralChatItemDelivery implements IChatItemDelivery {
  constructor(
    private readonly _subscribers: {
      type: "post" | "pin"
      chatItem: ChatItem
    }[][],
  ) {}

  public get subscribers() {
    return this._subscribers.map((s) => [...s])
  }

  public postMessage(message: Message) {
    this._subscribers.forEach((s) =>
      s.push({ type: "post", chatItem: message }),
    )
  }

  public postReaction(reaction: Reaction) {
    this._subscribers.forEach((s) =>
      s.push({ type: "post", chatItem: reaction }),
    )
  }

  public postQuestion(question: Question) {
    this._subscribers.forEach((s) =>
      s.push({ type: "post", chatItem: question }),
    )
  }

  public postAnswer(answer: Answer) {
    this._subscribers.forEach((s) => s.push({ type: "post", chatItem: answer }))
  }

  public pinChatItem(chatItem: ChatItem) {
    this._subscribers.forEach((s) => s.push({ type: "pin", chatItem }))
  }
}

export default EphemeralChatItemDelivery
