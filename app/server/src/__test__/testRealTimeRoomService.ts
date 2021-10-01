import { v4 as uuid } from "uuid"
import RoomClass from "../domain/room/Room"
import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import EphemeralChatItemDelivery from "../infra/delivery/chatItem/EphemeralChatItemDelivery"
import EphemeralRoomDelivery, {
  ChangeTopicStateContent,
  DeliveryType as RoomDeliveryType,
} from "../infra/delivery/room/EphemeralRoomDelivery"
import IRoomRepository from "../domain/room/IRoomRepository"
import ChatItem from "../domain/chatItem/ChatItem"
import Topic from "../domain/room/Topic"
import EphemeralChatItemRepository from "../infra/repository/chatItem/EphemeralChatItemRepository"
import RealtimeRoomService from "../service/room/RealtimeRoomService"
import User from "../domain/user/User"
import { RoomState, TopicState } from "sushi-chat-shared"
import { PartiallyPartial } from "../types/utils"
import { NewIconId } from "../domain/user/IconId"
import EphemeralAdminRepository from "../infra/repository/admin/EphemeralAdminRepository"
import Admin from "../domain/admin/admin"

describe("RealtimeRoomServiceのテスト", () => {
  let adminUser: User
  let topics: PartiallyPartial<Topic, "id" | "state" | "pinnedChatItemId">[]

  let roomRepository: IRoomRepository

  let roomDeliverySubscribers: {
    type: RoomDeliveryType
    content: Record<string, unknown>
  }[][]
  let chatItemDeliverySubscribers: {
    type: "post" | "pin"
    chatItem: ChatItem
  }[][]

  let roomService: RealtimeRoomService

  beforeEach(() => {
    const adminRepository = new EphemeralAdminRepository()
    roomRepository = new EphemeralRoomRepository(adminRepository)
    const userRepository = new EphemeralUserRepository()

    roomDeliverySubscribers = [[]]
    chatItemDeliverySubscribers = [[]]

    roomService = new RealtimeRoomService(
      roomRepository,
      userRepository,
      new EphemeralChatItemRepository(),
      new EphemeralRoomDelivery(roomDeliverySubscribers),
      new EphemeralChatItemDelivery(chatItemDeliverySubscribers),
    )

    const admin = new Admin(uuid(), "Admin", [])
    adminRepository.createIfNotExist(admin)

    const adminUserId = uuid()
    const roomId = uuid()
    // WebSocket接続するadmin user
    adminUser = new User(adminUserId, true, false, roomId, User.ADMIN_ICON_ID)
    userRepository.create(adminUser)

    const title = "テストルーム"
    const inviteKey = uuid()
    const description = "テスト用のルームです"
    topics = [1, 2].map((i) => ({ title: `テストトピック${i}` }))
    const state: RoomState = "ongoing"
    const startAt = new Date()
    const room = new RoomClass(
      roomId,
      title,
      inviteKey,
      description,
      topics,
      new Set([admin.id]),
      state,
      startAt,
    )
    roomRepository.build(room)
  })

  describe("changeTopicStateのテスト", () => {
    let deliveredRoomContentsCount: number
    let deliveredChatItemContentsCount: number

    beforeEach(async () => {
      await roomService.changeTopicState({
        userId: adminUser.id,
        topicId: 1,
        state: "ongoing",
      })

      deliveredRoomContentsCount = roomDeliverySubscribers[0].length
      deliveredChatItemContentsCount = chatItemDeliverySubscribers[0].length
    })

    test("正常系_進行中のtopicが終了して次のtopicが開始する", async () => {
      const nextTopicId = 2
      await roomService.changeTopicState({
        userId: adminUser.id,
        topicId: nextTopicId,
        state: "ongoing",
      })

      const room = await roomRepository.find(adminUser.roomId)
      if (!room) {
        throw new Error(`Room(${adminUser.roomId}) was not found.`)
      }

      expect(room.topics[0].state).toBe<TopicState>("finished")
      expect(room.topics[1].state).toBe<TopicState>("ongoing")

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredRoomContentsCount + 2,
      )
      const deliveredFinishContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount]
      expect(deliveredFinishContent.type).toBe<RoomDeliveryType>(
        "CHANGE_TOPIC_STATE",
      )
      expect(
        deliveredFinishContent.content,
      ).toStrictEqual<ChangeTopicStateContent>({
        roomId: adminUser.roomId,
        topic: {
          ...topics[0],
          id: 1,
          state: "finished",
          pinnedChatItemId: undefined,
        },
      })
      const deliveredOngoingContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount + 1]
      expect(deliveredOngoingContent.type).toBe<RoomDeliveryType>(
        "CHANGE_TOPIC_STATE",
      )
      expect(
        deliveredOngoingContent.content,
      ).toStrictEqual<ChangeTopicStateContent>({
        roomId: adminUser.roomId,
        topic: {
          ...topics[1],
          id: 2,
          state: "ongoing",
          pinnedChatItemId: undefined,
        },
      })

      // 運営ボットのメッセージ(前のトピックの終了と新たなトピックの開始の2つ)が配信されている
      expect(chatItemDeliverySubscribers[0]).toHaveLength(
        deliveredChatItemContentsCount + 2,
      )
    })

    test("正常系_進行中のtopicが終了する", async () => {
      const currentTopicId = 1
      await roomService.changeTopicState({
        userId: adminUser.id,
        topicId: currentTopicId,
        state: "finished",
      })

      const room = await roomRepository.find(adminUser.roomId)
      if (!room) {
        throw new Error(`Room(${adminUser.roomId}) was not found.`)
      }

      expect(room.topics[0].state).toBe<TopicState>("finished")

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredRoomContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CHANGE_TOPIC_STATE")
      expect(deliveredContent.content).toStrictEqual<ChangeTopicStateContent>({
        roomId: adminUser.roomId,
        topic: {
          ...topics[0],
          id: 1,
          state: "finished",
          pinnedChatItemId: undefined,
        },
      })

      // 運営ボットのメッセージがpostされている
      expect(chatItemDeliverySubscribers[0]).toHaveLength(
        deliveredChatItemContentsCount + 1,
      )
    })

    test("正常系_進行中のtopicが一時停止する", async () => {
      const currentTopicId = 1
      await roomService.changeTopicState({
        userId: adminUser.id,
        topicId: currentTopicId,
        state: "paused",
      })

      const room = await roomRepository.find(adminUser.roomId)
      if (!room) {
        throw new Error(`Room(${adminUser.roomId}) was not found.`)
      }

      expect(room.topics[0].state).toBe<TopicState>("paused")

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredRoomContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CHANGE_TOPIC_STATE")
      expect(deliveredContent.content).toStrictEqual<ChangeTopicStateContent>({
        roomId: adminUser.roomId,
        topic: {
          ...topics[0],
          id: 1,
          state: "paused",
          pinnedChatItemId: undefined,
        },
      })

      // 運営ボットのメッセージがpostされている
      expect(chatItemDeliverySubscribers[0]).toHaveLength(
        deliveredChatItemContentsCount + 1,
      )
    })
  })

  describe("finishのテスト", () => {
    test("正常系_roomが終了する", async () => {
      await roomService.finish({ userId: adminUser.id })

      const room = await roomRepository.find(adminUser.roomId)
      if (!room) {
        throw new Error(`Room(${adminUser.roomId}) was not found.`)
      }

      expect(room.state).toBe<RoomState>("finished")
      expect(room.finishAt).not.toBeNull()
    })

    test("異常系_存在しないuserはroomをfinishできない", async () => {
      const notExistUserId = uuid()

      await expect(() =>
        roomService.finish({ userId: notExistUserId }),
      ).rejects.toThrowError()
    })

    test("異常系_adminでないuserはroomをfinishできない", async () => {
      const notAdminUser = new User(
        uuid(),
        false,
        false,
        adminUser.roomId,
        NewIconId(1),
      )

      await expect(() =>
        roomService.finish({ userId: notAdminUser.id }),
      ).rejects.toThrowError()
    })
  })
})
