import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import IStampRepository from "../../domain/stamp/IStampRepository"
import Stamp from "../../domain/stamp/Stamp"
import { PostStampCommand } from "./commands"
import IStampDelivery from "../../domain/stamp/IStampDelivery"
import User from "../../domain/user/User"
import IUserRepository from "../../domain/user/IUserRepository"

class StampService {
  constructor(
    private readonly stampRepository: IStampRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly stampDelivery: IStampDelivery,
  ) {}

  public post(command: PostStampCommand): void {
    const user = this.findUser(command.userId)
    const roomId = user.getRoomIdOrThrow()

    const room = this.findRoom(roomId)
    const timestamp = room.getTimestamp(command.topicId)

    const stamp = new Stamp(command.userId, roomId, command.topicId, timestamp)
    room.postStamp(stamp)

    this.stampDelivery.pushStamp(stamp)
    this.stampRepository.store(stamp)
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

export default StampService
