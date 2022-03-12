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
import UserService from "../user/UserService"
import RealtimeRoomService from "../room/RealtimeRoomService"
import User from "../../domain/user/User"

class ChatItemService {
  constructor(
    private readonly chatItemRepository: IChatItemRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly chatItemDelivery: IChatItemDelivery,
  ) {}

  public static async findChatItemOrThrow(
    chatItemId: string,
    chatItemRepository: IChatItemRepository,
  ) {
    const chatItem = await chatItemRepository.find(chatItemId)
    if (!chatItem) {
      throw new Error(`ChatItem(id:${chatItemId}) was not found.`)
    }
    return chatItem
  }

  public async postMessage({
    topicId,
    chatItemId,
    quoteId,
    content,
    userId,
  }: PostMessageCommand) {
    const { user, senderType } = await this.fetchUserData(userId, topicId)
    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )
    const quote = quoteId
      ? ((await this.chatItemRepository.find(quoteId)) as Message | Answer)
      : null

    const message = new Message(
      chatItemId,
      topicId,
      user,
      senderType,
      content,
      quote,
      new Date(),
      room.calcTimestamp(topicId) ?? undefined,
    )

    room.postChatItem(userId, message)
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
    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )
    const quote = (await this.chatItemRepository.find(quoteId)) as
      | Message
      | Question
      | Answer

    const reaction = new Reaction(
      chatItemId,
      topicId,
      user,
      senderType,
      quote,
      new Date(),
      room.calcTimestamp(topicId) ?? undefined,
    )

    room.postChatItem(userId, reaction)
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
    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )

    const quote =
      quoteId == null
        ? null
        : ((await this.chatItemRepository.find(quoteId)) as Message | Answer)

    const question = new Question(
      chatItemId,
      topicId,
      user,
      senderType,
      content,
      quote,
      new Date(),
      room.calcTimestamp(topicId) ?? undefined,
    )

    room.postChatItem(userId, question)
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
    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )
    const quote = (await this.chatItemRepository.find(quoteId)) as Question

    const answer = new Answer(
      chatItemId,
      topicId,
      user,
      senderType,
      content,
      quote,
      new Date(),
      room.calcTimestamp(topicId) ?? undefined,
    )

    room.postChatItem(userId, answer)
    console.log(`answer: ${content}(id: ${chatItemId})`)

    this.chatItemDelivery.postAnswer(answer)
    await this.chatItemRepository.saveAnswer(answer)
  }

  public async pinChatItem({ chatItemId }: PinChatItemCommand) {
    const pinnedChatItem = await ChatItemService.findChatItemOrThrow(
      chatItemId,
      this.chatItemRepository,
    )
    // TODO: speakerしかピン留めできないようにする

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
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    const isAdmin = user.isAdmin

    // const roomId = user.roomId
    const senderType = isAdmin
      ? "admin"
      : user.speakAt === topicId
      ? "speaker"
      : "general"
    // const iconId = isAdmin ? User.ADMIN_ICON_ID : user.iconId

    return { user, senderType }
  }
}

export default ChatItemService
