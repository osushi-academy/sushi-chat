import IStampRepository from "../domain/stamp/IStampRepository"
import StampService from "../service/stamp/StampService"
import EphemeralStampRepository from "../infra/repository/stamp/EphemeralStampRepository"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
import EphemeralStampDelivery from "../infra/delivery/stamp/EphemeralStampDelivery"
import Stamp from "../domain/stamp/Stamp"
import delay from "../utils/delay"
import EphemeralAdminRepository from "../infra/repository/admin/EphemeralAdminRepository"
import StampFactory from "../infra/factory/StampFactory"
import Admin from "../domain/admin/admin"
import { v4 as uuid } from "uuid"
import User from "../domain/user/User"
import { NewIconId } from "../domain/user/IconId"
import RoomClass from "../domain/room/Room"

describe("StampServiceのテスト", () => {
  let userId: string
  let roomId: string

  let stampRepository: IStampRepository
  let stampDeliverySubscriber: Stamp[]
  let stampService: StampService

  beforeEach(() => {
    userId = uuid()
    roomId = uuid()

    const adminRepository = new EphemeralAdminRepository()
    const roomRepository = new EphemeralRoomRepository(adminRepository)
    const userRepository = new EphemeralUserRepository()
    stampRepository = new EphemeralStampRepository()

    stampDeliverySubscriber = []
    const stampDelivery = new EphemeralStampDelivery([stampDeliverySubscriber])
    const stampFactory = new StampFactory()

    stampService = new StampService(
      stampRepository,
      roomRepository,
      userRepository,
      stampDelivery,
      stampFactory,
    )

    const admin = new Admin(uuid(), "Admin", [])
    adminRepository.createIfNotExist(admin)

    roomId = uuid()
    userId = uuid()
    const user = new User(userId, false, false, roomId, NewIconId(1))
    userRepository.create(user)

    // stampを投稿するroomを作成しておく
    roomRepository.build(
      new RoomClass(
        roomId,
        "test room",
        uuid(),
        "This is test room.",
        [
          { id: 1, title: "test topic", state: "ongoing" },
          { id: 2, title: "test topic 2", state: "not-started" },
        ],
        new Set([admin.id]),
        "ongoing",
        new Date(),
        {
          1: { openedDate: Date.now(), pausedDate: null, offsetTime: 100 },
          2: { openedDate: null, pausedDate: null, offsetTime: 0 },
        },
        null,
        null,
        new Set([userId]),
      ),
    )
  })

  describe("postのテスト", () => {
    test("正常系_stampを投稿する", async () => {
      const stampId = uuid()
      await stampService.post({ id: stampId, userId, topicId: 1 })
      // stampIntervalDeliveryのインターバル処理でスタンプで配信されるのを待つ
      await delay(200)

      expect(await stampRepository.count(roomId, 1, userId)).toBe(1)
      expect(stampDeliverySubscriber).toHaveLength(1)
      const deliveredStamp = stampDeliverySubscriber[0]
      expect(deliveredStamp.roomId).toBe(roomId)
      expect(deliveredStamp.topicId).toBe(1)
      expect(deliveredStamp.userId).toBe(userId)
    })

    test("異常系_ONGOING状態でないTopicへはスタンプを投稿できない", async () => {
      const stampId = uuid()
      await expect(() =>
        stampService.post({ id: stampId, userId, topicId: 2 }),
      ).rejects.toThrowError()
    })
  })
})
