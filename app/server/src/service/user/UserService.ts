import {
  AdminEnterCommand,
  CreateUserCommand,
  UserEnterCommand,
  UserLeaveCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import IUserDelivery from "../../domain/user/IUserDelivery"

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userDelivery: IUserDelivery,
  ) {}

  public createUser(command: CreateUserCommand): void {
    const newUser = new User(command.userId)
    this.userRepository.create(newUser)
  }

  public adminEnterRoom(command: AdminEnterCommand): RoomClass {
    const admin = this.userRepository.find(command.adminId)
    admin.enterRoom(command.roomId, User.ADMIN_ICON_ID)

    const room = this.findRoom(command.roomId)
    const activeUserCount = room.joinUser(command.adminId, User.ADMIN_ICON_ID)

    this.userDelivery.enterRoom(admin, activeUserCount)
    this.userRepository.update(admin)
    this.roomRepository.update(room)

    return room
  }

  public enterRoom(command: UserEnterCommand): RoomClass {
    const user = this.userRepository.find(command.userId)
    user.enterRoom(command.roomId, command.iconId)

    const room = this.findRoom(command.roomId)
    const activeUserCount = room.joinUser(command.userId, command.iconId)

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)
    this.roomRepository.update(room)

    return room
  }

  public leaveRoom(command: UserLeaveCommand): void {
    const user = this.userRepository.find(command.userId)
    // まだRoomに参加していないユーザーなら何もしない
    if (user.roomId === null) return

    const room = this.findRoom(user.roomId)
    const activeUserCount = room.leaveUser(user.id)

    this.userDelivery.leaveRoom(user, activeUserCount)
    user.leaveRoom()

    this.userRepository.update(user)
    this.roomRepository.update(room)
  }

  private findRoom(roomId: string): RoomClass {
    const room = this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }
}

export default UserService
