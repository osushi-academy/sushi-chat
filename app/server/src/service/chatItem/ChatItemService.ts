import IRoomRepository from "../../domain/room/IRoomRepository"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"
import Message from "../../domain/chatItem/Message"
import Answer from "../../domain/chatItem/Answer"
import Reaction from "../../domain/chatItem/Reaction"
import Question from "../../domain/chatItem/Question"
import {
  PinChatItemCommand,
  PostAnswerCommand,
  PostMessageCommand,
  PostQuestionCommand,
  PostReactionCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import IChatItemDelivery from "../../domain/chatItem/IChatItemDelivery"
import { ChatItemSenderType } from "sushi-chat-shared"
import User from "../../domain/user/User"
import {
  ArgumentError,
  ErrorWithCode,
  NotFoundError,
  StateError,
} from "../../error"

class ChatItemService {
  constructor(
    private readonly chatItemRepository: IChatItemRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly chatItemDelivery: IChatItemDelivery,
  ) {}

  public async postMessage({
    topicId,
    chatItemId,
    quoteId,
    content,
    userId,
  }: PostMessageCommand) {
    const { user, senderType } = await this.fetchUserData(userId, topicId)
    const roomId = user.roomId

    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room${roomId}) was not found.`, 404)
    }

    const quote = quoteId
      ? ((await this.chatItemRepository.find(quoteId)) as Message | Answer)
      : null

    let timestamp: number
    try {
      timestamp = room.calcTimestamp(topicId)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new ErrorWithCode(e.message, 404)
      } else {
        throw new Error(e.message)
      }
    }
    const message = new Message(
      chatItemId,
      topicId,
      user,
      senderType,
      content,
      quote,
      new Date(),
      timestamp,
    )

    try {
      room.postChatItem(userId, message)
    } catch (e) {
      if (e instanceof ArgumentError || e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else if (e instanceof NotFoundError) {
        // userがroomに参加していなかった場合
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new Error(e.message)
      }
    }
    console.log(`message: ${content}(id: ${chatItemId})`)

    this.chatItemDelivery.postMessage(message)
    await this.chatItemRepository.saveMessage(message)
  }

  public async postReaction({
    chatItemId,
    topicId,
    userId,
    quoteId,
  }: PostReactionCommand) {
    const { user, senderType } = await this.fetchUserData(userId, topicId)
    const roomId = user.roomId

    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room${roomId}) was not found.`, 404)
    }

    const quote = (await this.chatItemRepository.find(quoteId)) as
      | Message
      | Question
      | Answer

    let timestamp: number
    try {
      timestamp = room.calcTimestamp(topicId)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new ErrorWithCode(e.message, 404)
      } else {
        throw new Error(e.message)
      }
    }
    const reaction = new Reaction(
      chatItemId,
      topicId,
      user,
      senderType,
      quote,
      new Date(),
<<<<<<< HEAD
      timestamp,
=======
      room.calcTimestamp(topicId) ?? undefined,
>>>>>>> develop
    )

    try {
      room.postChatItem(userId, reaction)
    } catch (e) {
      if (e instanceof ArgumentError || e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else if (e instanceof NotFoundError) {
        // userがroomに参加していなかった場合
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new Error(e.message)
      }
    }
    console.log(`reaction to ${quoteId}(id: ${chatItemId})`)

    this.chatItemDelivery.postReaction(reaction)
    await this.chatItemRepository.saveReaction(reaction)
  }

  public async postQuestion({
    topicId,
    chatItemId,
    userId,
    content,
    quoteId,
  }: PostQuestionCommand) {
    const { user, senderType } = await this.fetchUserData(userId, topicId)
    const roomId = user.roomId

    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room${roomId}) was not found.`, 404)
    }

    const quote =
      quoteId == null
        ? null
        : ((await this.chatItemRepository.find(quoteId)) as Message | Answer)

    let timestamp: number
    try {
      timestamp = room.calcTimestamp(topicId)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new ErrorWithCode(e.message, 404)
      } else {
        throw new Error(e.message)
      }
    }
    const question = new Question(
      chatItemId,
      topicId,
      user,
      senderType,
      content,
      quote,
      new Date(),
<<<<<<< HEAD
      timestamp,
=======
      room.calcTimestamp(topicId) ?? undefined,
>>>>>>> develop
    )

    try {
      room.postChatItem(userId, question)
    } catch (e) {
      if (e instanceof ArgumentError || e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else if (e instanceof NotFoundError) {
        // userがroomに参加していなかった場合
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new Error(e.message)
      }
    }
    console.log(`question: ${content}(id: ${chatItemId})`)

    this.chatItemDelivery.postQuestion(question)
    await this.chatItemRepository.saveQuestion(question)
  }

  public async postAnswer({
    chatItemId,
    userId,
    quoteId,
    topicId,
    content,
  }: PostAnswerCommand) {
    const { user, senderType } = await this.fetchUserData(userId, topicId)
    const roomId = user.roomId

    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room(${roomId} was not found.`, 404)
    }

    const quote = (await this.chatItemRepository.find(quoteId)) as Question

    let timestamp: number
    try {
      timestamp = room.calcTimestamp(topicId)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new ErrorWithCode(e.message, 404)
      } else {
        throw new Error(e.message)
      }
    }
    const answer = new Answer(
      chatItemId,
      topicId,
      user,
      senderType,
      content,
      quote,
      new Date(),
<<<<<<< HEAD
      timestamp,
=======
      room.calcTimestamp(topicId) ?? undefined,
>>>>>>> develop
    )

    try {
      room.postChatItem(userId, answer)
    } catch (e) {
      if (e instanceof ArgumentError || e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else if (e instanceof NotFoundError) {
        // userがroomに参加していなかった場合
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new Error(e.message)
      }
    }
    console.log(`answer: ${content}(id: ${chatItemId})`)

    this.chatItemDelivery.postAnswer(answer)
    await this.chatItemRepository.saveAnswer(answer)
  }

  public async pinChatItem({ chatItemId }: PinChatItemCommand) {
    const pinnedChatItem = await this.chatItemRepository.find(chatItemId)
    if (!pinnedChatItem) {
      throw new ErrorWithCode(`ChatItem(${chatItemId}) was not found.`, 404)
    }
   //TODO: speakerしかピン留めできないようにする

    this.chatItemDelivery.pinChatItem(pinnedChatItem)
    await this.chatItemRepository.pinChatItem(pinnedChatItem)
  }

  private fetchUserData = async (
    userId: string,
    topicId: number,
  ): Promise<{
    user: User
    senderType: ChatItemSenderType
  }> => {
    const user = await this.userRepository.find(userId)
    if (!user) {
      throw new ErrorWithCode(`User(${userId}) was not found.`, 404)
    }

    const senderType = user.isAdmin
      ? "admin"
      : user.speakAt === topicId
      ? "speaker"
      : "general"

    return { user, senderType }
  }
}

export default ChatItemService
