import { v4 as uuid } from "uuid"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import RoomClass from "../domain/room/Room"
import UserService from "../service/user/UserService"
import EphemeralUserRepository from "../infra/repository/User/EphemeralUserRepository"
import EphemeralUserDelivery from "../infra/delivery/user/EphemeralUserDelivery"
import MockAdminAuth from "../infra/auth/MockAdminAuth"
import User from "../domain/user/User"
import IUserRepository from "../domain/user/IUserRepository"
import IRoomRepository from "../domain/room/IRoomRepository"
import IUserDelivery from "../domain/user/IUserDelivery"
import IAdminAuth from "../domain/admin/IAdminAuth"
import IconId, { NewIconId } from "../domain/user/IconId"
import EphemeralAdminRepository from "../infra/repository/admin/EphemeralAdminRepository"
import Admin from "../domain/admin/admin"

describe("UserServiceのテスト", () => {
  let adminId: string
  let roomId: string
  let userId: string
  let iconId: IconId

  let userRepository: IUserRepository
  let roomRepository: IRoomRepository
  let userDelivery: IUserDelivery
  let adminAuth: IAdminAuth

  let userService: UserService

  beforeEach(() => {
    adminId = uuid()
    const adminName = "Admin"

    const adminRepository = new EphemeralAdminRepository()
    userRepository = new EphemeralUserRepository()
    roomRepository = new EphemeralRoomRepository(adminRepository)
    userDelivery = new EphemeralUserDelivery([])
    adminAuth = new MockAdminAuth({ id: adminId, name: adminName })
    userService = new UserService(
      userRepository,
      roomRepository,
      userDelivery,
      adminAuth,
    )

    adminRepository.createIfNotExist(new Admin(adminId, adminName, []))

    roomId = uuid()
    userId = uuid()
    iconId = NewIconId(Math.floor(Math.random() * 9) + 1)
  })

  describe("adminEnterRoomのテスト", () => {
    test("正常系_管理者がroomに参加する", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "ongoing",
      )
      roomRepository.build(room)

      await userService.adminEnterRoom({ roomId, userId, idToken: "" })

      const user = await userRepository.find(userId)
      if (!user) {
        throw new Error(`User(${userId}) was not found.`)
      }

      expect(user.id).toBe(userId)
      expect(user.roomId).toBe(roomId)
      expect(user.speakAt).toBeUndefined()
      expect(user.iconId).toBe(User.ADMIN_ICON_ID)
      expect(user.isAdmin).toBeTruthy()
    })
  })

  describe("enterRoomのテスト", () => {
    test("正常系_一般ユーザーがroomに参加する", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "ongoing",
      )
      roomRepository.build(room)

      const iconId = 1
      await userService.enterRoom({ userId, roomId, iconId })

      const user = await userRepository.find(userId)
      if (!user) {
        throw new Error(`User(${userId}) was not found.`)
      }

      expect(user.id).toBe(userId)
      expect(user.roomId).toBe(roomId)
      expect(user.speakAt).toBeUndefined()
      expect(user.iconId).toBe(iconId)
      expect(user.isAdmin).toBeFalsy()
    })
  })

  describe("leaveRoomのテスト", () => {
    beforeEach(() => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "ongoing",
        new Date(),
        [],
        null,
        null,
        new Set([userId]),
      )
      roomRepository.build(room)
    })

    test("正常系_管理者ユーザーがroomから退出する", async () => {
      userRepository.create(new User(userId, true, roomId, iconId))

      await userService.leaveRoom({ userId })

      const user = await userRepository.find(userId)

      // roomから退出したuserは取得されない
      expect(user).toBeNull()
    })

    test("正常系_一般ユーザーがroomから退出する", async () => {
      userRepository.create(new User(userId, false, roomId, iconId))

      await userService.leaveRoom({ userId })

      const user = await userRepository.find(userId)

      // roomから退出したuserは取得されない
      expect(user).toBeNull()
    })
  })
})
