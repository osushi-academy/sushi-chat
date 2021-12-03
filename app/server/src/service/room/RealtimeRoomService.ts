import IRoomRepository from "../../domain/room/IRoomRepository"
import { ChangeTopicStateCommand, FinishRoomCommand } from "./commands"
import IChatItemDelivery from "../../domain/chatItem/IChatItemDelivery"
import IRoomDelivery from "../../domain/room/IRoomDelivery"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"
import IUserRepository from "../../domain/user/IUserRepository"
import Message from "../../domain/chatItem/Message"
import {
  ArgumentError,
  ErrorWithCode,
  NotFoundError,
  StateError,
} from "../../error"

class RealtimeRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly chatItemRepository: IChatItemRepository,
    private readonly roomDelivery: IRoomDelivery,
    private readonly chatItemDelivery: IChatItemDelivery,
  ) {}

  /**
   * idからroomを取得。存在しなければエラーを投げる
   * @param roomId
   * @param roomRepository
   */
  public static async findRoomOrThrow(
    roomId: string,
    roomRepository: IRoomRepository,
  ) {
    const room = await roomRepository.find(roomId)
    if (!room) {
      throw new Error(`Room(id:${roomId}) was not found.`)
    }
    return room
  }

  /** Roomを終了して投稿できなくする。閲覧は可能。
   *  Adminのみ実行可能
   *  @param roomId
   */
  public async finish({ userId }: FinishRoomCommand) {
    const user = await this.userRepository.find(userId)
    if (!user) {
      throw new ErrorWithCode(`User(${userId}) was not found.`, 404)
    }
    if (!user.isAdmin) {
      throw new ErrorWithCode(`User(${userId}) is not admin.`, 403)
    }

    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )

    try {
      room.finishRoom()
    } catch (e) {
      if (e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new ErrorWithCode(e.message)
      }
    }

    await this.roomRepository.update(room)
  }

  /** topicのstateを変更する
   *  Adminのみ実行可能
   *  @param topicId
   *  @param userId
   *  @param state
   */
  public async changeTopicState({
    topicId,
    userId,
    state,
  }: ChangeTopicStateCommand) {
    const user = await this.userRepository.find(userId)
    if (!user) {
      throw new ErrorWithCode(`User(${userId}) was not found.`, 404)
    }
    if (!user.isAdmin) {
      throw new ErrorWithCode(`User(${userId}) is not admin.`, 403)
    }

    const roomId = user.roomId

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )

    let messages: Message[]
    try {
      messages = room.changeTopicState(topicId, state)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new ErrorWithCode(e.message, 404)
      } else if (e instanceof ArgumentError || e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new ErrorWithCode(e.message)
      }
    }

    messages.forEach((m) => {
      this.chatItemDelivery.postMessage(m)
      this.roomDelivery.changeTopicState(roomId, room.topics[m.topicId - 1])
    })

    await Promise.all([
      this.roomRepository.update(room),
      ...messages.map((m) => this.chatItemRepository.saveMessage(m)),
    ])
  }
}

export default RealtimeRoomService
