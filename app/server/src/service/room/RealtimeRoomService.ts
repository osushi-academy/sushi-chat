import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import { BuildRoomCommand, ChangeTopicStateCommand } from "./commands"
import IStampDelivery from "../../domain/stamp/IStampDelivery"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"
import IChatItemDelivery from "../../domain/chatItem/IChatItemDelivery"
import IRoomDelivery from "../../domain/room/IRoomDelivery"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"

class RealtimeRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly chatItemRepository: IChatItemRepository,
    private readonly roomDelivery: IRoomDelivery,
    private readonly chatItemDelivery: IChatItemDelivery,
    private readonly stampDelivery: IStampDelivery,
  ) {}

  public async start(userId: string) {
    const user = this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = await this.find(roomId)
    room.startRoom()

    this.roomDelivery.start(room.id)
    this.roomRepository.update(room)
  }

  // Roomを終了し、投稿をできなくする。閲覧は可能
  public async finish(userId: string) {
    const user = this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = await this.find(roomId)
    room.finishRoom()

    this.roomDelivery.finish(room.id)
    this.stampDelivery.finishIntervalDelivery()
    this.roomRepository.update(room)
  }

  // Roomをアーカイブし、閲覧できなくする。RESTのエンドポイントに移行予定
  public async close(userId: string) {
    const user = this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = await this.find(roomId)
    room.closeRoom()

    this.roomDelivery.close(room.id)
    this.roomRepository.update(room)
  }

  public async changeTopicState(command: ChangeTopicStateCommand) {
    const user = this.findUser(command.userId)
    const roomId = user.getRoomIdOrThrow()

    const room = await this.find(roomId)
    const { messages, activeTopic } = room.changeTopicState(
      command.topicId,
      command.type,
    )

    this.roomDelivery.changeTopicState(command.type, roomId, command.topicId)
    this.roomRepository.update(room)

    for (const m of messages) {
      this.chatItemDelivery.postMessage(m)
      this.chatItemRepository.saveMessage(m)
    }

    if (activeTopic !== null) {
      this.stampDelivery.startIntervalDelivery()
    } else {
      this.stampDelivery.finishIntervalDelivery()
    }
  }

  private async find(roomId: string): Promise<RoomClass> {
    const room = await this.roomRepository.find(roomId)
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

export default RealtimeRoomService
