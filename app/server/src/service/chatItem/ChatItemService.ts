import RoomClass from "../../domain/room/Room"
import IRoomRepository from "../../domain/room/IRoomRepository"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"
import Message from "../../domain/chatItem/Message"
import Answer from "../../domain/chatItem/Answer"
import Reaction from "../../domain/chatItem/Reaction"
import Question from "../../domain/chatItem/Question"
import {
  PostAnswerCommand,
  PostMessageCommand,
  PostQuestionCommand,
  PostReactionCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"

class ChatItemService {
  constructor(
    private readonly chatItemRepository: IChatItemRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  public async postMessage(command: PostMessageCommand): Promise<void> {
    const user = this.findUser(command.userId)
    const room = this.findRoom(user.roomId)
    const target =
      command.targetId !== undefined && command.targetId !== null
        ? ((await this.chatItemRepository.find(command.targetId)) as
            | Message
            | Answer)
        : null

    const message = new Message(
      command.chatItemId,
      command.topicId,
      user.roomId,
      user.iconId,
      new Date(),
      command.content,
      target,
      room.getTimestamp(command.topicId),
    )

    room.postChatItem(command.userId, message)
    console.log(`message: ${command.content}(id: ${command.chatItemId})`)

    this.chatItemRepository.saveMessage(message)
  }

  public async postReaction(command: PostReactionCommand): Promise<void> {
    const user = this.findUser(command.userId)
    const room = this.findRoom(user.roomId)
    const target = (await this.chatItemRepository.find(command.targetId)) as
      | Message
      | Question
      | Answer

    const reaction = new Reaction(
      command.chatItemId,
      command.topicId,
      user.roomId,
      user.iconId,
      new Date(),
      target,
      room.getTimestamp(command.topicId),
    )

    console.log(`reaction: to ${command.targetId}`)
    room.postChatItem(command.userId, reaction)

    this.chatItemRepository.saveReaction(reaction)
  }

  public postQuestion(command: PostQuestionCommand): void {
    const user = this.findUser(command.userId)
    const room = this.findRoom(user.roomId)

    const question = new Question(
      command.chatItemId,
      command.topicId,
      user.roomId,
      user.iconId,
      new Date(),
      command.content,
      room.getTimestamp(command.topicId),
    )

    room.postChatItem(command.userId, question)
    console.log(`question: ${command.content}(id: ${command.chatItemId})`)

    this.chatItemRepository.saveQuestion(question)
  }

  public async postAnswer(command: PostAnswerCommand): Promise<void> {
    const user = this.findUser(command.userId)
    const room = this.findRoom(user.roomId)
    const target = (await this.chatItemRepository.find(
      command.targetId,
    )) as Question

    const answer = new Answer(
      command.chatItemId,
      command.topicId,
      user.roomId,
      user.iconId,
      new Date(),
      command.content,
      target,
      room.getTimestamp(command.topicId),
    )

    room.postChatItem(command.userId, answer)
    console.log(`answer: ${command.content}(id: ${command.chatItemId})`)

    this.chatItemRepository.saveAnswer(answer)
  }

  private findRoom(roomId: string): RoomClass {
    const room = this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }

  private findUser(userId: string): User {
    const user = this.userRepository.find(userId)
    if (!user) {
      throw new Error(`User(id :${userId}) was not found.`)
    }
    return user
  }
}

export default ChatItemService
