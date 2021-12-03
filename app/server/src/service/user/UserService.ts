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
import { ChatItemModel, StampModel, TopicState } from "sushi-chat-shared"
import StampModelBuilder from "../stamp/StampModelBuilder"
import IconId, { NewIconId } from "../../domain/user/IconId"
import IAdminAuth from "../../domain/admin/IAdminAuth"
import {
  ArgumentError,
  ErrorWithCode,
  NotAuthorizedError,
  StateError,
} from "../../error"

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userDelivery: IUserDelivery,
    private readonly adminAuth: IAdminAuth,
  ) {}

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
    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room(${roomId}) was not found.`, 404)
    }

    const { adminId } = await this.adminAuth.verifyIdToken(idToken)

    // roomが始まっていない or adminでないと、ここでエラー
    let activeUserCount: number
    try {
      activeUserCount = room.joinAdminUser(userId, adminId)
    } catch (e) {
      if (e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else if (e instanceof NotAuthorizedError) {
        throw new ErrorWithCode(e.message, 403)
      } else {
        throw new ErrorWithCode(e.message)
      }
    }

    // roomにjoinできたらuserも作成

    await this.createUser(
      activeUserCount,
      userId,
      roomId,
      User.ADMIN_ICON_ID,
      true,
    )

    let chatItems: ChatItemModel[]
    try {
      chatItems = ChatItemModelBuilder.buildChatItems(room.chatItems)
    } catch (e) {
      if (e instanceof ArgumentError) {
        throw new ErrorWithCode(e.message, 500)
      } else {
        throw new ErrorWithCode(e.message)
      }
    }

    return {
      chatItems,
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
    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room(${roomId}) was not found`, 404)
    }

    // roomが始まっていないとここでエラー
    let activeUserCount: number
    try {
      activeUserCount = room.joinUser(userId)
    } catch (e) {
      if (e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new ErrorWithCode(e.message)
      }
    }

    let newIconId: IconId
    try {
      newIconId = NewIconId(iconId)
    } catch (e) {
      if (e instanceof ArgumentError) {
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new ErrorWithCode(e.message)
      }
    }

    await this.createUser(
      activeUserCount,
      userId,
      roomId,
      newIconId,
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
      // ユーザーがまだ登録されていなければ、ルームに入る前に接続が切れたと判断して何も処理をしない
      return
    }
    const roomId = user.roomId

    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room(${roomId}) was not found.`)
    }

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
