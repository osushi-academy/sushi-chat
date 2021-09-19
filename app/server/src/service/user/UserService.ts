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
import ChatItemResponseBuilder from "../chatItem/ChatItemResponseBuilder"
import { ChatItem } from "../../chatItem"
import Topic from "../../domain/room/Topic"

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

  public async adminEnterRoom(command: AdminEnterCommand): Promise<{
    chatItems: ChatItem[]
    topics: Topic[]
    activeUserCount: number
  }> {
    const room = await this.findRoom(command.roomId)
    const user = this.userRepository.find(command.userId)

    // roomが始まっていない/adminでないとここでエラー
    const activeUserCount = room.joinAdminUser(command.userId, command.adminId)

    // roomにjoinできたらuserにもroomIdとiconIdを覚えさせる
    user.enterRoomAsAdmin(command.roomId, User.ADMIN_ICON_ID)

    const chatItemResponses = ChatItemResponseBuilder.buildChatItems(
      room.chatItems,
    )

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)
    await this.roomRepository.update(room)

    return {
      chatItems: chatItemResponses,
      topics: room.topics,
      activeUserCount,
    }
  }

  public async enterRoom(command: UserEnterCommand): Promise<{
    chatItems: ChatItem[]
    topics: Topic[]
    activeUserCount: number
  }> {
    const room = await this.findRoom(command.roomId)
    // roomが始まっていないとここでエラー
    const activeUserCount = room.joinUser(command.userId)

    const user = this.userRepository.find(command.userId)
    // roomにjoinできたらuserにもroomIdとiconIdを覚えさせる
    user.enterRoom(command.roomId, command.iconId)

    const chatItemResponses = ChatItemResponseBuilder.buildChatItems(
      room.chatItems,
    )

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)
    await this.roomRepository.update(room)

    return {
      chatItems: chatItemResponses,
      topics: room.topics,
      activeUserCount,
    }
  }

  public async leaveRoom(command: UserLeaveCommand) {
    const user = this.userRepository.find(command.userId)
    // まだRoomに参加していないユーザーなら何もしない
    if (user.roomId === null) return

    const room = await this.findRoom(user.roomId)
    const activeUserCount = room.leaveUser(user.id)

    this.userDelivery.leaveRoom(user, activeUserCount)
    user.leaveRoom()

    this.userRepository.update(user)
    this.roomRepository.update(room)
  }

  private async findRoom(roomId: string): Promise<RoomClass> {
    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }
}

export default UserService
