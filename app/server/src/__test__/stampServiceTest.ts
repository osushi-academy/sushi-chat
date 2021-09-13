import IStampRepository from "../domain/stamp/IStampRepository"
import StampService from "../service/stamp/StampService"
import EphemeralStampRepository from "../infra/repository/stamp/EphemeralStampRepository"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
import EphemeralStampDelivery from "../infra/delivery/stamp/EphemeralStampDelivery"
import getUUID from "sushi-chat-front/utils/getUUID"
import Stamp from "../domain/stamp/Stamp"
import delay from "../utils/delay"
import RoomService from "../service/room/RoomService"
import EphemeralRoomDelivery from "../infra/delivery/room/EphemeralRoomDelivery"
import EphemeralChatItemDelivery from "../infra/delivery/chatItem/EphemeralChatItemDelivery"
import UserService from "../service/user/UserService"
import EphemeralUserDelivery from "../infra/delivery/user/EphemeralUserDelivery"
import EphemeralChatItemRepository from "../infra/repository/chatItem/EphemeralChatItemRepository"

describe("StampServiceのテスト", () => {
  let adminId: string
  let userId: string
  let roomId: string
  let topicIdToBePosted: string
  let stampRepository: IStampRepository
  let stampDeliverySubscribers: Stamp[][]
  let stampService: StampService
  let userService: UserService
  let roomService: RoomService

  beforeEach(async () => {
    adminId = getUUID()
    userId = getUUID()
    roomId = getUUID()
    topicIdToBePosted = "1"

    stampRepository = new EphemeralStampRepository()
    const roomRepository = new EphemeralRoomRepository()
    const userRepository = new EphemeralUserRepository()
    stampDeliverySubscribers = [[]]
    const stampDelivery = new EphemeralStampDelivery(stampDeliverySubscribers)
    const roomDelivery = new EphemeralRoomDelivery([])
    const chatItemDelivery = new EphemeralChatItemDelivery([])
    const userDelivery = new EphemeralUserDelivery([])

    stampService = new StampService(
      stampRepository,
      roomRepository,
      userRepository,
      stampDelivery,
    )
    userService = new UserService(userRepository, roomRepository, userDelivery)
    roomService = new RoomService(
      roomRepository,
      userRepository,
      new EphemeralChatItemRepository(),
      roomDelivery,
      chatItemDelivery,
      stampDelivery,
    )

    userService.createUser({ userId: adminId })
    roomService.build({
      id: roomId,
      title: "テストルーム",
      topics: [1, 2].map((i) => ({
        title: `テストトピック${i}`,
        description: `テスト用のトピック${i}です`,
        urls: {},
      })),
    })
    await userService.adminEnterRoom({ adminId, roomId })
    await roomService.start(adminId)
    await roomService.changeTopicState({
      userId: adminId,
      topicId: topicIdToBePosted,
      type: "OPEN",
    })
    // スタンプを投稿する一般ユーザーが入室
    userService.createUser({ userId })
    await userService.enterRoom({ userId, roomId, iconId: "1" })
  })

  afterEach(() => {
    roomService.changeTopicState({
      userId: adminId,
      topicId: topicIdToBePosted,
      type: "CLOSE",
    })
    roomService.finish(adminId)
  })

  describe("post()のテスト", () => {
    test("正常系_post()を実行するとStampが保存・配信される", async () => {
      // まだスタンプを投稿していないので何も保存・配信されていない
      expect(
        await stampRepository.count(roomId, topicIdToBePosted, userId),
      ).toBe(0)
      expect(stampDeliverySubscribers[0].length).toBe(0)

      await stampService.post({ userId, topicId: topicIdToBePosted })
      // stampIntervalDeliveryのインターバル処理でスタンプで配信されるのを待つ
      await delay(1000)

      expect(
        await stampRepository.count(roomId, topicIdToBePosted, userId),
      ).toBe(1)
      expect(stampDeliverySubscribers[0]).toHaveLength(1)
      const deliveredStamp = stampDeliverySubscribers[0][0]
      expect(deliveredStamp.roomId).toBe(roomId)
      expect(deliveredStamp.topicId).toBe(topicIdToBePosted)
      expect(deliveredStamp.userId).toBe(userId)
    })

    test("異常系_Roomに参加していないユーザーはスタンプを投稿できない", async () => {
      const notJoiningUserId = getUUID()
      userService.createUser({ userId: notJoiningUserId })

      await expect(() =>
        stampService.post({
          userId: notJoiningUserId,
          topicId: topicIdToBePosted,
        }),
      ).rejects.toThrowError()
    })

    test("異常系_OPEN状態でないTopicへはスタンプを投稿できない", async () => {
      await expect(() =>
        stampService.post({ userId, topicId: "2" }),
      ).rejects.toThrowError()
    })
  })
})
