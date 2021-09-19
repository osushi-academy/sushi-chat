import {
  CreateUserCommand,
  UserEnterCommand,
  UserLeaveCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"
import IRoomRepository from "../../domain/room/IRoomRepository"
import IUserDelivery from "../../domain/user/IUserDelivery"
import ChatItemModelBuilder from "../chatItem/ChatItemModelBuilder"
import Admin from "../../domain/admin/admin"
import IAdminRepository from "../../domain/admin/IAdminRepository"
import RealtimeRoomService from "../room/RealtimeRoomService"
import { NewIconId } from "../../domain/user/IconId"
import { ChatItemModel, StampModel, TopicState } from "sushi-chat-shared"
import StampModelBuilder from "../stamp/StampModelBuilder"

class UserService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userDelivery: IUserDelivery,
  ) {}

  public static async findUserOrThrow(
    id: string,
    adminRepository: IAdminRepository,
    userRepository: IUserRepository,
  ): Promise<User | Admin> {
    const admin = await adminRepository.find(id)
    if (admin) return admin

    const user = await userRepository.find(id)
    if (user) return user

    throw new Error(`User|Admin(id:${id}) was not found.`)
  }

  public createUser(command: CreateUserCommand): void {
    const newUser = new User(command.userId)
    this.userRepository.create(newUser)
  }

  public async enterRoom({
    roomId,
    speakerTopicId,
    userId,
    iconId,
  }: UserEnterCommand): Promise<{
    chatItems: ChatItemModel[]
    stamps: StampModel[]
    activeUserCount: number
    pinnedChatItemIds: (string | null)[]
    topicStates: { topicId: number; state: TopicState }[]
  }> {
    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )
    const user = await UserService.findUserOrThrow(
      userId,
      this.adminRepository,
      this.userRepository,
    )

    const activeUserCount = room.joinUser(userId)
    this.userDelivery.enterRoom(user, activeUserCount)

    if (user instanceof User) {
      user.enterRoom(roomId, NewIconId(iconId), speakerTopicId)
      this.userRepository.update(user)
    }

    await this.roomRepository.update(room)

    return {
      chatItems: ChatItemModelBuilder.buildChatItems(room.chatItems),
      stamps: StampModelBuilder.buildStamps(room.stamps),
      activeUserCount,
      pinnedChatItemIds: room.topics.map((t) => t.pinnedChatItemId ?? null),
      topicStates: room.topics.map((t) => ({ topicId: t.id, state: t.state })),
    }
  }

  public async leaveRoom({ roomId, userId }: UserLeaveCommand) {
    const user = await UserService.findUserOrThrow(
      userId,
      this.adminRepository,
      this.userRepository,
    )

    // まだRoomに参加していないユーザーなら何もしない
    if (!roomId) return

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )

    const activeUserCount = room.leaveUser(user.id)
    this.userDelivery.leaveRoom(user, activeUserCount)

    if (user instanceof User) {
      user.leaveRoom()
    }

    this.roomRepository.update(room)
  }
}

export default UserService
