import IRoomRepository from "../../domain/room/IRoomRepository"
import { ChangeTopicStateCommand, FinishRoomCommand } from "./commands"
import IChatItemDelivery from "../../domain/chatItem/IChatItemDelivery"
import IRoomDelivery from "../../domain/room/IRoomDelivery"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"
import UserService from "../user/UserService"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"

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
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    UserService.validateAdmin(user)

    const roomId = user.getRoomIdOrThrow()

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )

    room.finishRoom()

    this.roomRepository.update(room)
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
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    UserService.validateAdmin(user)

    const roomId = user.getRoomIdOrThrow()

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )
    const messages = room.changeTopicState(topicId, state)

    this.roomDelivery.changeTopicState(roomId, room.topics[topicId])
    this.roomRepository.update(room)

    for (const m of messages) {
      this.chatItemDelivery.postMessage(m)
      this.chatItemRepository.saveMessage(m)
    }
  }
}

export default RealtimeRoomService
