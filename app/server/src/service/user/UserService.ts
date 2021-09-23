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
    const verifyRes = await this.adminAuth.verifyIdToken(idToken)
    const activeUserCount = room.joinAdminUser(userId, verifyRes.adminId)

    // roomにjoinできたらuserも作成
    const user = this.createUser(userId, roomId, User.ADMIN_ICON_ID, true)
    this._enterRoom(user, activeUserCount)

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

    // roomが始まっていないとここでエラー
    const activeUserCount = room.joinUser(userId)

    const user = this.createUser(
      userId,
      roomId,
      NewIconId(iconId),
      false,
      speakerTopicId,
    )
    this._enterRoom(user, activeUserCount)

    return {
      chatItems: ChatItemModelBuilder.buildChatItems(room.chatItems),
      stamps: StampModelBuilder.buildStamps(room.stamps),
      activeUserCount,
      pinnedChatItemIds: room.topics.map((t) => t.pinnedChatItemId ?? null),
      topicStates: room.topics.map((t) => ({ topicId: t.id, state: t.state })),
    }
  }

  public async leaveRoom({ userId, user }: UserLeaveCommand) {
    user =
      user ?? (await UserService.findUserOrThrow(userId, this.userRepository))

    const room = await RealtimeRoomService.findRoomOrThrow(
      user.roomId,
      this.roomRepository,
    )

    const activeUserCount = room.leaveUser(user.id)

    this.userDelivery.leaveRoom(user, activeUserCount)
    this.userRepository.leaveRoom(user)
  }

  public async leaveRoomOnDisconnect({ userId }: UserLeaveCommand) {
    const user = await this.userRepository.find(userId)
    if (!user) {
      // 操作不要
      return
    }
    this.leaveRoom({ userId, user })
  }

  private createUser(
    userId: string,
    roomId: string,
    iconId: IconId,
    isAdmin: boolean,
    speakAt?: number,
  ): User {
    const newUser = new User(userId, isAdmin, roomId, iconId, speakAt)
    this.userRepository.create(newUser)

    return newUser
  }

  private _enterRoom(user: User, activeUserCount: number) {
    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.create(user)
  }
}

export default UserService
