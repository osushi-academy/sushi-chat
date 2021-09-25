import {
  AdminEnterCommand,
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
import IconId, { NewIconId } from "../../domain/user/IconId"
import IAdminAuth from "../../domain/admin/IAdminAuth"

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userDelivery: IUserDelivery,
    private readonly adminAuth: IAdminAuth,
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

  public async adminEnterRoom({
    roomId,
    userId,
    idToken,
  }: AdminEnterCommand): Promise<{
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

    // roomが始まっていない or adminでないと、ここでエラー
    const { adminId } = await this.adminAuth.verifyIdToken(idToken)
    const activeUserCount = room.joinAdminUser(userId, adminId)

    // roomにjoinできたらuserも作成

    await this.createUser(
      activeUserCount,
      userId,
      roomId,
      User.ADMIN_ICON_ID,
      true,
    )

    return {
      chatItems: ChatItemModelBuilder.buildChatItems(room.chatItems),
      stamps: StampModelBuilder.buildStamps(room.stamps),
      activeUserCount,
      pinnedChatItemIds: room.pinnedChatItemIds,
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

    // roomが始まっていないとここでエラー
    const activeUserCount = room.joinUser(userId)

    await this.createUser(
      activeUserCount,
      userId,
      roomId,
      NewIconId(iconId),
      false,
      speakerTopicId,
    )

    return {
      chatItems: ChatItemModelBuilder.buildChatItems(room.chatItems),
      stamps: StampModelBuilder.buildStamps(room.stamps),
      activeUserCount,
      pinnedChatItemIds: room.pinnedChatItemIds,
      topicStates: room.topics.map((t) => ({ topicId: t.id, state: t.state })),
    }
  }

  public async leaveRoom({ userId }: UserLeaveCommand) {
    const user = await this.userRepository.find(userId)
    if (!user) {
      // 操作不要
      return
    }
    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )

    const activeUserCount = room.leaveUser(user.id)

    this.userDelivery.leaveRoom(user, activeUserCount)
    await this.userRepository.leaveRoom(user)
  }

  private async createUser(
    activeUserCount: number,
    userId: string,
    roomId: string,
    iconId: IconId,
    isAdmin: boolean,
    speakAt?: number,
  ) {
    const newUser = new User(userId, isAdmin, false, roomId, iconId, speakAt)

    this.userDelivery.enterRoom(newUser, activeUserCount)
    await this.userRepository.create(newUser)
  }
}

export default UserService
