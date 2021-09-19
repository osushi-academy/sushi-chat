import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import {
  ArchiveRoomCommand,
  BuildRoomCommand,
  InviteRoomCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"
import { v4 as uuid } from "uuid"
class RestRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  // Roomを作成する。
  public build(command: BuildRoomCommand): RoomClass {
    // TODO: いつか適切な場所に移動する
    const adminInviteKey = uuid()

    const room = new RoomClass(
      command.id,
      command.title,
      command.description ?? "",
      adminInviteKey,
      command.topics,
    )
    this.roomRepository.build(room)

    console.log(`new room build: ${command.id}`)

    return room
  }

  // Roomに管理者を紐付ける
  public async inviteAdmin(command: InviteRoomCommand): Promise<RoomClass> {
    const room = await this.find(command.id)
    // きっとこんな感じになると思っている
    room.inviteAdmin(command.adminId, command.adminInviteKey)

    this.roomRepository.update(room)
    console.log(`new admin invited to room: ${command.id}`)

    return room
  }

  // Roomをアーカイブし、閲覧できなくする。
  public async archive(command: ArchiveRoomCommand) {
    const room = await this.find(command.id)
    room.archiveRoom(command.adminId)

    this.roomRepository.update(room)
  }

  public async find(roomId: string): Promise<RoomClass> {
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

export default RestRoomService
