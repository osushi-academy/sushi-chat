import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import { ChangeTopicStateCommand, BuildRoomCommand } from "./commands"
import IStampDelivery from "../../domain/stamp/IStampDelivery"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"

class RoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly stampDelivery: IStampDelivery,
  ) {}

  public build(command: BuildRoomCommand): RoomClass {
    const room = new RoomClass(command.id, command.title, command.topics)
    this.roomRepository.build(room)

    console.log(`new room build: ${command.id}`)

    return room
  }

  public start(userId: string): void {
    const user = this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = this.find(roomId)
    room.startRoom()

    this.roomRepository.update(room)
  }

  // Roomを終了し、投稿をできなくする。閲覧は可能
  public finish(userId: string): void {
    const user = this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = this.find(roomId)
    room.finishRoom()

    this.roomRepository.update(room)
  }

  // Roomをアーカイブし、閲覧できなくする。RESTのエンドポイントに移行予定
  public close(userId: string): void {
    const user = this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = this.find(roomId)
    room.closeRoom()

    this.roomRepository.update(room)
  }

  public changeTopicState(command: ChangeTopicStateCommand): void {
    const user = this.findUser(command.userId)
    const roomId = user.getRoomIdOrThrow()

    const room = this.find(roomId)
    room.changeTopicState({
      roomId: roomId,
      type: command.type,
      topicId: command.topicId,
    })

    if (command.type === "OPEN" || command.type === "CLOSE_AND_OPEN") {
      this.stampDelivery.startIntervalDelivery()
    }
    this.roomRepository.update(room)
  }

  private find(roomId: string): RoomClass {
    const room = this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }

  // FIXME: そもそも渡されるroomIdがnullで有り得ることがおかしいので、本当はいらない。このバリデーションは無くすべき
  public static validateRoomId(roomId: string): void {
    if (roomId == null) {
      throw new Error("[sushi-chat-server] You do not joined in any room")
    }
  }

  private findUser(userId: string): User {
    const user = this.userRepository.find(userId)
    if (!user) {
      throw new Error(`User(id :${userId}) was not found.`)
    }
    return user
  }
}

export default RoomService
