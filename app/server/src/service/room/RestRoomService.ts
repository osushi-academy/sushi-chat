import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import {
  ArchiveRoomCommand,
  BuildRoomCommand,
  InviteRoomCommand,
  StartRoomCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import IRoomFactory from "../../domain/room/IRoomFactory"

class RestRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly roomFactory: IRoomFactory,
  ) {}

  // Roomを作成する。
  public build(command: BuildRoomCommand): RoomClass {
    const room = this.roomFactory.create(
      command.title,
      command.topics,
      command.description,
    )
    this.roomRepository.build(room)

    console.log(`new room build: ${room.id}`)

    return room
  }

  // Roomを開始する。
  public async start(command: StartRoomCommand) {
    const room = await this.find(command.id)
    room.startRoom(command.adminId)

    this.roomRepository.update(room)
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
}

export default RestRoomService
