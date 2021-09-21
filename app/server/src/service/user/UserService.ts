import {
  AdminEnterCommand,
  CreateUserCommand,
  UserEnterCommand,
  UserLeaveCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"
import IRoomRepository from "../../domain/room/IRoomRepository"
import IUserDelivery from "../../domain/user/IUserDelivery"
import ChatItemModelBuilder from "../chatItem/ChatItemModelBuilder"
import RealtimeRoomService from "../room/RealtimeRoomService"
import { ChatItemModel, StampModel, TopicState } from "sushi-chat-shared"
import StampModelBuilder from "../stamp/StampModelBuilder"
import { NewIconId } from "../../domain/user/IconId"

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userDelivery: IUserDelivery,
  ) {}

  public static async findUserOrThrow(
    id: string,
    userRepository: IUserRepository,
  ): Promise<User> {
    const user = await userRepository.find(id)
    if (!user) {
      throw new Error(`User(id:${id}) was not found.`)
    }
    return user
  }

  public static validateAdmin(user: User): void {
    if (!user.isAdmin) {
      throw new Error(`User(id:${user.id}) is not admin.`)
    }
  }

  public async createUser({
    userId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    idToken,
  }: CreateUserCommand): Promise<void> {
    const isAdmin = idToken ? await this.verifyIdToken(idToken) : false
    const newUser = new User(userId, isAdmin)
    await this.userRepository.create(newUser)
  }

  public async adminEnterRoom({ roomId, userId }: AdminEnterCommand): Promise<{
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
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    UserService.validateAdmin(user)

    const activeUserCount = room.joinUser(userId)
    user.enterRoom(roomId, User.ADMIN_ICON_ID)

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)

    return {
      chatItems: ChatItemModelBuilder.buildChatItems(room.chatItems),
      stamps: StampModelBuilder.buildStamps(room.stamps),
      activeUserCount,
      pinnedChatItemIds: room.topics.map((t) => t.pinnedChatItemId ?? null),
      topicStates: room.topics.map((t) => ({ topicId: t.id, state: t.state })),
    }
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
    const user = await UserService.findUserOrThrow(userId, this.userRepository)

    const activeUserCount = room.joinUser(userId)
    user.enterRoom(roomId, NewIconId(iconId), speakerTopicId)

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)

    return {
      chatItems: ChatItemModelBuilder.buildChatItems(room.chatItems),
      stamps: StampModelBuilder.buildStamps(room.stamps),
      activeUserCount,
      pinnedChatItemIds: room.topics.map((t) => t.pinnedChatItemId ?? null),
      topicStates: room.topics.map((t) => ({ topicId: t.id, state: t.state })),
    }
  }

  public async leaveRoom({ userId }: UserLeaveCommand) {
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    const roomId = user.roomId

    // まだroomに参加していないuserならば何もしない
    if (!roomId) return

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )

    const activeUserCount = room.leaveUser(user.id)
    user.leaveRoom()

    this.userDelivery.leaveRoom(user, activeUserCount)
    this.userRepository.update(user)
  }

  private async verifyIdToken(idToken: string): Promise<boolean> {
    console.log(idToken)
    throw new Error("Not implemented.")
  }
}

export default UserService
