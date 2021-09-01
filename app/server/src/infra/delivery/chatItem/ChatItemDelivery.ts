import IChatItemDelivery from "../../../domain/chatItem/IChatItemDelivery"
import { Server } from "socket.io"
import Message from "../../../domain/chatItem/Message"
import ChatItemResponseBuilder from "../../../service/chatItem/ChatItemResponseBuilder"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"

class ChatItemDelivery implements IChatItemDelivery {
  constructor(private readonly globalSocket: Server) {}

  public postMessage(message: Message): void {
    const messageResponse = ChatItemResponseBuilder.buildMessage(message)
    this.globalSocket.to(message.roomId).emit("PUB_CHAT_ITEM", messageResponse)
  }

  public postReaction(reaction: Reaction): void {
    const reactionResponse = ChatItemResponseBuilder.buildReaction(reaction)
    this.globalSocket
      .to(reaction.roomId)
      .emit("PUB_CHAT_ITEM", reactionResponse)
  }

  public postQuestion(question: Question): void {
    const questionResponse = ChatItemResponseBuilder.buildQuestion(question)
    this.globalSocket
      .to(question.roomId)
      .emit("PUB_CHAT_ITEM", questionResponse)
  }

  public postAnswer(answer: Answer): void {
    const answerResponse = ChatItemResponseBuilder.buildAnswer(answer)
    this.globalSocket.to(answer.roomId).emit("PUB_CHAT_ITEM", answerResponse)
  }
}

export default ChatItemDelivery
