import IChatItemDelivery from "../../../domain/chatItem/IChatItemDelivery"
import Message from "../../../domain/chatItem/Message"
import ChatItemModelBuilder from "../../../service/chatItem/ChatItemModelBuilder"
import Reaction from "../../../domain/chatItem/Reaction"
import Question from "../../../domain/chatItem/Question"
import Answer from "../../../domain/chatItem/Answer"
import { GlobalSocket } from "../../../ioServer"
import ChatItem from "../../../domain/chatItem/ChatItem"

class ChatItemDelivery implements IChatItemDelivery {
  constructor(private readonly globalSocket: GlobalSocket) {}

  public postMessage(message: Message) {
    const messageResponse = ChatItemModelBuilder.buildMessage(message)
    this.globalSocket.to(message.roomId).emit("PUB_CHAT_ITEM", messageResponse)
  }

  public postReaction(reaction: Reaction) {
    const reactionResponse = ChatItemModelBuilder.buildReaction(reaction)
    this.globalSocket
      .to(reaction.roomId)
      .emit("PUB_CHAT_ITEM", reactionResponse)
  }

  public postQuestion(question: Question) {
    const questionResponse = ChatItemModelBuilder.buildQuestion(question)
    this.globalSocket
      .to(question.roomId)
      .emit("PUB_CHAT_ITEM", questionResponse)
  }

  public postAnswer(answer: Answer) {
    const answerResponse = ChatItemModelBuilder.buildAnswer(answer)
    this.globalSocket.to(answer.roomId).emit("PUB_CHAT_ITEM", answerResponse)
  }

  public pinChatItem(chatItem: ChatItem): void {
    this.globalSocket.to(chatItem.roomId).emit("PUB_PINNED_MESSAGE", {
      chatItemId: chatItem.id,
      topicId: chatItem.topicId,
    })
  }
}

export default ChatItemDelivery
