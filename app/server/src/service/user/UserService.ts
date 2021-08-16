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
import ServerSocket from "../../serverSocket"

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
  ) {}

  public createUser(command: CreateUserCommand): void {
    const newUser = new User(command.userId)
    this.userRepository.create(newUser)
  }

  public adminEnterRoom(command: AdminEnterCommand): RoomClass {
    const admin = this.userRepository.find(command.adminId)
    admin.enterRoom(command.roomId, User.ADMIN_ICON_ID)
    this.userRepository.update(admin)

    const room = this.findRoom(command.roomId)
    const serverSocket = new ServerSocket(command.adminSocket, command.roomId)
    room.joinUser(serverSocket, User.ADMIN_ICON_ID)
    this.roomRepository.update(room)

    return room
  }

  public enterRoom(command: UserEnterCommand): RoomClass {
    const user = this.userRepository.find(command.userId)
    user.enterRoom(command.roomId, command.iconId)
    this.userRepository.update(user)

    const room = this.findRoom(command.roomId)
    const serverSocket = new ServerSocket(command.userSocket, command.roomId)
    room.joinUser(serverSocket, command.iconId)
    this.roomRepository.update(room)

    return room
  }

  public leaveRoom(command: UserLeaveCommand): void {
    const user = this.userRepository.find(command.userId)
    // まだRoomに参加していないユーザーなら何もしない
    if (user.roomId === null) return

    const room = this.findRoom(user.roomId)
    user.leaveRoom()
    const activeUserCount = room.leaveUser(user.id)

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
