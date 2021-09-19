import { v4 as uuid } from "uuid"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import { BuildRoomCommand } from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"

class RestRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  // Roomを作成する。
  public build(command: BuildRoomCommand): RoomClass {
    const inviteKey = uuid()
    const room = new RoomClass(
      command.id,
      command.title,
      inviteKey,
      command.topics,
      command.description,
    )
    this.roomRepository.build(room)

    console.log(`new room build: ${command.id}`)

    return room
  }

  // Roomをアーカイブし、閲覧できなくする。
  public async archive(userId: string) {
    const user = await this.findUser(userId)
    const roomId = user.getRoomIdOrThrow()

    const room = await this.find(roomId)
    room.archiveRoom()

    this.roomRepository.update(room)
  }

  private async find(roomId: string): Promise<RoomClass> {
    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.userRepository.find(userId)
    if (!user) {
      throw new Error(`User(id :${userId}) was not found.`)
    }
    return user
  }
}

export default RestRoomService
