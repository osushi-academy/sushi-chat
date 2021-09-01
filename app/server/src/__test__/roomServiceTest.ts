import { v4 as uuid } from "uuid"
import RoomService from "../service/room/RoomService"
import EphemeralStampDelivery from "../infra/delivery/stamp/EphemeralStampDelivery"
import RoomClass from "../domain/room/Room"
import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import EphemeralChatItemDelivery from "../infra/delivery/chatItem/EphemeralChatItemDelivery"
import EphemeralRoomDelivery, {
  DeliveryType as RoomDeliveryType,
} from "../infra/delivery/room/EphemeralRoomDelivery"
import EphemeralUserDelivery from "../infra/delivery/user/EphemeralUserDelivery"
import IRoomRepository from "../domain/room/IRoomRepository"
import ChatItem from "../domain/chatItem/ChatItem"
import UserService from "../service/user/UserService"
import Topic, { TopicLinkType, TopicState } from "../domain/room/Topic"
import EphemeralChatItemRepository from "../infra/repository/chatItem/EphemeralChatItemRepository"

describe("RoomServiceのテスト", () => {
  let adminId: string
  let roomId: string
  let roomTitle: string
  let topics: Omit<Topic, "id" | "state">[]

  let roomRepository: IRoomRepository

  let roomDeliverySubscribers: {
    type: RoomDeliveryType
    content: Record<string, unknown>
  }[][]
  let chatItemDeliverySubscribers: ChatItem[][]

  let roomService: RoomService
  let userService: UserService

  beforeEach(() => {
    adminId = uuid()
    roomId = uuid()
    roomTitle = "テストルーム"
    topics = [1, 2].map((i) => ({
      title: `テストトピック${i}`,
      description: `テスト用のトピック${i}です`,
      urls: {
        github: `https://github.com/${i}`,
        product: `https://product.com${i}`,
        slide: `https://slide.com/${i}`,
      },
    }))

    roomRepository = new EphemeralRoomRepository()
    const userRepository = new EphemeralUserRepository()

    roomDeliverySubscribers = [[]]
    chatItemDeliverySubscribers = [[]]

    roomService = new RoomService(
      roomRepository,
      userRepository,
      new EphemeralChatItemRepository(),
      new EphemeralRoomDelivery(roomDeliverySubscribers),
      new EphemeralChatItemDelivery(chatItemDeliverySubscribers),
      new EphemeralStampDelivery([]),
    )
    userService = new UserService(
      userRepository,
      roomRepository,
      new EphemeralUserDelivery([]),
    )

    userService.createUser({ userId: adminId })
  })

  describe("buildのテスト", () => {
    test("正常系_buildによりRoomが作成される", async () => {
      buildRoom()

      const result = roomRepository.find(roomId)
      expect(result).not.toBeNull()
      const room = (await result) as RoomClass
      expect(room.id).toBe(roomId)
      expect(room.title).toBe(roomTitle)
      expect(room.topics).toHaveLength(topics.length)
      for (const i in topics) {
        expect(room.topics[i].title).toBe(topics[i].title)
        expect(room.topics[i].description).toBe(topics[i].description)
        expect(room.topics[i].urls).toStrictEqual<
          Partial<Record<TopicLinkType, string>>
        >(topics[i].urls)
      }
    })

    // TODO: 引数のtopicsのバリデーションを実装していないのでテストが落ちます。RoomService実装を修正する必要があります。
    test("異常系_引数のtopicsが一つもないときはエラーが投げられる", () => {
      const emptyTopics: Omit<Topic, "id" | "state">[] = []
      expect(() =>
        roomService.build({
          id: roomId,
          title: roomTitle,
          topics: emptyTopics,
        }),
      ).toThrowError()
    })
  })

  describe("startのテスト", () => {
    beforeEach(() => {
      buildRoom()
    })

    test("正常系_startによりRoomが開始が配信される", async () => {
      await adminEnterAndStartRoom()

      expect(roomDeliverySubscribers[0]).toHaveLength(1)
      const deliveredContent = roomDeliverySubscribers[0][0]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("START")
      expect(deliveredContent.content).toStrictEqual({ roomId })
    })

    test("異常系_存在しないUserはRoomをstartできない", async () => {
      const notExistUserId = uuid()
      await expect(() =>
        roomService.start(notExistUserId),
      ).rejects.toThrowError()
    })

    test("異常系＿Roomに参加していないUserはRoomをstartできない", async () => {
      const notJoiningUserId = uuid()
      userService.createUser({ userId: notJoiningUserId })
      await expect(() =>
        roomService.start(notJoiningUserId),
      ).rejects.toThrowError()
    })
  })

  describe("changeTopicStateのテスト", () => {
    let deliveredRoomContentsCount: number
    let deliveredChatItemContentsCount: number

    beforeEach(async () => {
      buildRoom()
      await adminEnterAndStartRoom()

      await roomService.changeTopicState({
        userId: adminId,
        topicId: "1",
        type: "OPEN",
      })

      deliveredRoomContentsCount = roomDeliverySubscribers[0].length
      deliveredChatItemContentsCount = chatItemDeliverySubscribers[0].length
    })

    // IntervalStampDeliveryが停止しないとテストが停止しないので、強制終了させている
    afterEach(async () => {
      await roomService.finish(adminId)
    })

    test("正常系_changeTopicState(type: OPEN)によりOPENだったTopicがCLOSEされ、指定されたTopicがOPENし、それが配信され、運営ボットのメッセージがpostされる", async () => {
      const topicIdToBeOpen = "2"
      await roomService.changeTopicState({
        userId: adminId,
        topicId: topicIdToBeOpen,
        type: "OPEN",
      })

      const room = (await roomRepository.find(roomId)) as RoomClass
      expect(room.topics[0].state).toBe<TopicState>("finished")
      expect(room.topics[1].state).toBe<TopicState>("active")

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredRoomContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CHANGE_TOPIC_STATE")
      expect(deliveredContent.content).toStrictEqual({
        type: "OPEN",
        roomId,
        topicId: topicIdToBeOpen,
      })

      // 運営ボットのメッセージ(前のトピックの終了と新たなトピックの開始の2つ)が配信されている
      expect(chatItemDeliverySubscribers[0]).toHaveLength(
        deliveredChatItemContentsCount + 2,
      )
    })

    test("正常系_changeTopicState(type: CLOSE)により指定されたTopicがCLOSEし、それが配信され、運営ボットのメッセージがpostされる", async () => {
      const topicIdToBeClose = "1"
      await roomService.changeTopicState({
        userId: adminId,
        topicId: topicIdToBeClose,
        type: "CLOSE",
      })

      const room = (await roomRepository.find(roomId)) as RoomClass
      expect(room.topics[0].state).toBe<TopicState>("finished")

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredRoomContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CHANGE_TOPIC_STATE")
      expect(deliveredContent.content).toStrictEqual({
        type: "CLOSE",
        roomId,
        topicId: topicIdToBeClose,
      })

      // 運営ボットのメッセージがpostされている
      expect(chatItemDeliverySubscribers[0]).toHaveLength(
        deliveredChatItemContentsCount + 1,
      )
    })

    test("正常系_changeTopicState(type: PAUSE)により指定されたTopicがPAUSEし、それが配信され、運営ボットのメッセージがpostされる", async () => {
      const topicIdToBePAUSE = "1"
      await roomService.changeTopicState({
        userId: adminId,
        topicId: topicIdToBePAUSE,
        type: "PAUSE",
      })

      const room = (await roomRepository.find(roomId)) as RoomClass
      expect(room.topics[0].state).toBe<TopicState>("paused")

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredRoomContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredRoomContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CHANGE_TOPIC_STATE")
      expect(deliveredContent.content).toStrictEqual({
        type: "PAUSE",
        roomId,
        topicId: topicIdToBePAUSE,
      })

      // 運営ボットのメッセージがpostされている
      expect(chatItemDeliverySubscribers[0]).toHaveLength(
        deliveredChatItemContentsCount + 1,
      )
    })
  })

  describe("finishのテスト", () => {
    beforeEach(async () => {
      buildRoom()
      await adminEnterAndStartRoom()
    })

    test("正常系_finishによりRoomのfinishが配信される", async () => {
      const deliveredContentsCount = roomDeliverySubscribers[0].length
      await roomService.finish(adminId)

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("FINISH")
      expect(deliveredContent.content).toStrictEqual({ roomId })
    })

    test("異常系_存在しないUserはRoomをfinishできない", async () => {
      const notExistUserId = uuid()
      await expect(() =>
        roomService.finish(notExistUserId),
      ).rejects.toThrowError()
    })

    test("異常系_Roomに参加していないUserはRoomをfinishできない", async () => {
      const notJoiningUserId = uuid()
      userService.createUser({ userId: notJoiningUserId })
      await expect(() =>
        roomService.finish(notJoiningUserId),
      ).rejects.toThrowError()
    })
  })

  describe("closeのテスト", () => {
    beforeEach(async () => {
      buildRoom()
      await adminEnterAndStartRoom()
    })

    test("正常系_closeによりRoomのcloseが配信される", async () => {
      const deliveredContentsCount = roomDeliverySubscribers[0].length
      await roomService.close(adminId)

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CLOSE")
      expect(deliveredContent.content).toStrictEqual({ roomId })
    })

    test("異常系_存在しないUserはRoomをcloseできない", async () => {
      const notExistUserId = uuid()
      await expect(() =>
        roomService.close(notExistUserId),
      ).rejects.toThrowError()
    })

    test("異常系_Roomに参加していないUserはRoomをcloseできない", async () => {
      const notJoiningUserId = uuid()
      userService.createUser({ userId: notJoiningUserId })
      await expect(() =>
        roomService.close(notJoiningUserId),
      ).rejects.toThrowError()
    })
  })

  const buildRoom = () =>
    roomService.build({
      id: roomId,
      title: roomTitle,
      topics,
    })

  const adminEnterAndStartRoom = async () => {
    await userService.adminEnterRoom({
      roomId,
      adminId,
    })
    await roomService.start(adminId)
  }
})
