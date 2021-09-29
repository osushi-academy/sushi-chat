import IRoomRepository from "../../domain/room/IRoomRepository"
import { ChangeTopicStateCommand, FinishRoomCommand } from "./commands"
import IChatItemDelivery from "../../domain/chatItem/IChatItemDelivery"
import IRoomDelivery from "../../domain/room/IRoomDelivery"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"
import UserService from "../user/UserService"
import IUserRepository from "../../domain/user/IUserRepository"
import ChatItem from "../../domain/chatItem/ChatItem"
import Message from "../../domain/chatItem/Message"
import { v4 as uuid } from "uuid"
import User from "../../domain/user/User"
import RoomBotMessageHelper from "./RoomBotMessageHelper"

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
    if (!user.isAdmin) {
      throw new Error(`User(id:${userId}) is not admin.`)
    }

    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )

    room.finishRoom()

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
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    if (!user.isAdmin) {
      throw new Error(`User(id:${userId}) is not admin.`)
    }
    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )

    const changedTopics = room.changeTopicState(topicId, state)

    // トピックの変更を配信
    changedTopics.forEach(({ id }) => {
      this.roomDelivery.changeTopicState(room.id, room.topics[id])
    })

    // Botメッセージを作成
    const chatItems = changedTopics.map(({ id, newState, oldState }) =>
      RoomBotMessageHelper.buildTopicStateChangeMessage(
        room,
        id,
        oldState,
        newState,
      ),
    )

    chatItems.forEach((chatItem) => {
      // Botメッセージをモデルに反映
      room.postChatItem(room.systemUser.id, chatItem)
      // Botメッセージを配信
      this.chatItemDelivery.postMessage(chatItem)
    })

    await Promise.all([
      this.roomRepository.update(room),
      ...chatItems.map((m) => this.chatItemRepository.saveMessage(m)),
    ])
  }
}

export default RealtimeRoomService
