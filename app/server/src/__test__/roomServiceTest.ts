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
    test("正常系_buildによりRoomが作成される", () => {
      buildRoom()

      const result = roomRepository.find(roomId)
      expect(result).not.toBeNull()
      const room = result as RoomClass
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

    test("正常系_startによりRoomが開始が配信される", () => {
      adminEnterAndStartRoom()

      expect(roomDeliverySubscribers[0]).toHaveLength(1)
      const deliveredContent = roomDeliverySubscribers[0][0]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("START")
      expect(deliveredContent.content).toStrictEqual({ roomId })
    })

    test("異常系_存在しないUserはRoomをstartできない", () => {
      const notExistUserId = uuid()
      expect(() => roomService.start(notExistUserId)).toThrowError()
    })

    test("異常系＿Roomに参加していないUserはRoomをstartできない", () => {
      const notJoiningUserId = uuid()
      userService.createUser({ userId: notJoiningUserId })
      expect(() => roomService.start(notJoiningUserId)).toThrowError()
    })
  })

  describe("changeTopicStateのテスト", () => {
    let deliveredRoomContentsCount: number
    let deliveredChatItemContentsCount: number

    beforeEach(() => {
      buildRoom()
      adminEnterAndStartRoom()

      roomService.changeTopicState({
        userId: adminId,
        topicId: "1",
        type: "OPEN",
      })

      deliveredRoomContentsCount = roomDeliverySubscribers[0].length
      deliveredChatItemContentsCount = chatItemDeliverySubscribers[0].length
    })

    // IntervalStampDeliveryが停止しないとテストが停止しないので、強制終了させている
    afterEach(() => {
      roomService.finish(adminId)
    })

    test("正常系_changeTopicState(type: OPEN)によりOPENだったTopicがCLOSEされ、指定されたTopicがOPENし、それが配信され、運営ボットのメッセージがpostされる", () => {
      const topicIdToBeOpen = "2"
      roomService.changeTopicState({
        userId: adminId,
        topicId: topicIdToBeOpen,
        type: "OPEN",
      })

      const room = roomRepository.find(roomId) as RoomClass
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

    test("正常系_changeTopicState(type: CLOSE)により指定されたTopicがCLOSEし、それが配信され、運営ボットのメッセージがpostされる", () => {
      const topicIdToBeClose = "1"
      roomService.changeTopicState({
        userId: adminId,
        topicId: topicIdToBeClose,
        type: "CLOSE",
      })

      const room = roomRepository.find(roomId) as RoomClass
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

    test("正常系_changeTopicState(type: PAUSE)により指定されたTopicがPAUSEし、それが配信され、運営ボットのメッセージがpostされる", () => {
      const topicIdToBePAUSE = "1"
      roomService.changeTopicState({
        userId: adminId,
        topicId: topicIdToBePAUSE,
        type: "PAUSE",
      })

      const room = roomRepository.find(roomId) as RoomClass
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
    beforeEach(() => {
      buildRoom()
      adminEnterAndStartRoom()
    })

    test("正常系_finishによりRoomのfinishが配信される", () => {
      const deliveredContentsCount = roomDeliverySubscribers[0].length
      roomService.finish(adminId)

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("FINISH")
      expect(deliveredContent.content).toStrictEqual({ roomId })
    })

    test("異常系_存在しないUserはRoomをfinishできない", () => {
      const notExistUserId = uuid()
      expect(() => roomService.finish(notExistUserId)).toThrowError()
    })

    test("異常系_Roomに参加していないUserはRoomをfinishできない", () => {
      const notJoiningUserId = uuid()
      userService.createUser({ userId: notJoiningUserId })
      expect(() => roomService.finish(notJoiningUserId)).toThrowError()
    })
  })

  describe("closeのテスト", () => {
    beforeEach(() => {
      buildRoom()
      adminEnterAndStartRoom()
    })

    test("正常系_closeによりRoomのcloseが配信される", () => {
      const deliveredContentsCount = roomDeliverySubscribers[0].length
      roomService.close(adminId)

      expect(roomDeliverySubscribers[0]).toHaveLength(
        deliveredContentsCount + 1,
      )
      const deliveredContent =
        roomDeliverySubscribers[0][deliveredContentsCount]
      expect(deliveredContent.type).toBe<RoomDeliveryType>("CLOSE")
      expect(deliveredContent.content).toStrictEqual({ roomId })
    })

    test("異常系_存在しないUserはRoomをcloseできない", () => {
      const notExistUserId = uuid()
      expect(() => roomService.close(notExistUserId)).toThrowError()
    })

    test("異常系_Roomに参加していないUserはRoomをcloseできない", () => {
      const notJoiningUserId = uuid()
      userService.createUser({ userId: notJoiningUserId })
      expect(() => roomService.close(notJoiningUserId)).toThrowError()
    })
  })

  const buildRoom = () =>
    roomService.build({
      id: roomId,
      title: roomTitle,
      topics,
    })

  const adminEnterAndStartRoom = () => {
    userService.adminEnterRoom({
      roomId,
      adminId,
    })
    roomService.start(adminId)
  }
})
