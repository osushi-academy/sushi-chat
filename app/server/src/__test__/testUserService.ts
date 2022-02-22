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
  let adminUserId: string
  let adminUserIconId: IconId
  let normalUserId: string
  let normalUserIconId: IconId

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

    adminUserId = uuid()
    adminUserIconId = NewIconId(Math.floor(Math.random() * 10) + 1)

    normalUserId = uuid()
    normalUserIconId = NewIconId(Math.floor(Math.random() * 10) + 1)
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

      await userService.adminEnterRoom({
        roomId,
        userId: adminUserId,
        idToken: "",
      })

      const adminUser = await userRepository.find(adminUserId)
      if (!adminUser) {
        throw new Error(`User(${adminUserId}) was not found.`)
      }

      expect(adminUser.id).toBe(adminUserId)
      expect(adminUser.roomId).toBe(roomId)
      expect(adminUser.speakAt).toBeUndefined()
      expect(adminUser.iconId).toBe(User.ADMIN_ICON_ID)
      expect(adminUser.isAdmin).toBeTruthy()
    })

    test("異常系_存在しないroomに参加しようとするとエラーになる", async () => {
      const notExistRoomId = uuid()
      await expect(() =>
        userService.adminEnterRoom({
          roomId: notExistRoomId,
          userId: adminUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
    })

    test("異常系_開始していないroomに参加しようとするとエラーになる", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "not-started",
      )
      roomRepository.build(room)

      await expect(() =>
        userService.adminEnterRoom({
          roomId,
          userId: adminUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
    })

    test("異常系_終了したroomに参加しようとするとエラーになる", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "finished",
      )
      roomRepository.build(room)

      await expect(() =>
        userService.adminEnterRoom({
          roomId,
          userId: adminUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
    })

    test("異常系_アーカイブされたroomに参加しようとするとエラーになる", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "archived",
      )
      roomRepository.build(room)

      await expect(() =>
        userService.adminEnterRoom({
          roomId,
          userId: adminUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
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

      await userService.enterRoom({
        userId: normalUserId,
        roomId,
        iconId: normalUserIconId.valueOf(),
      })

      const normalUser = await userRepository.find(normalUserId)
      if (!normalUser) {
        throw new Error(`User(${normalUserId}) was not found.`)
      }

      expect(normalUser.id).toBe(normalUserId)
      expect(normalUser.roomId).toBe(roomId)
      expect(normalUser.speakAt).toBeUndefined()
      expect(normalUser.iconId).toBe(normalUserIconId)
      expect(normalUser.isAdmin).toBeFalsy()
    })

    test("異常系_存在しないroomに参加しようとするとエラーになる", async () => {
      const notExistRoomId = uuid()
      await expect(() =>
        userService.adminEnterRoom({
          roomId: notExistRoomId,
          userId: normalUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
    })

    test("異常系_開始していないroomに参加しようとするとエラーになる", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "not-started",
      )
      roomRepository.build(room)

      await expect(() =>
        userService.adminEnterRoom({
          roomId,
          userId: normalUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
    })

    test("異常系_終了したroomに参加しようとするとエラーになる", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "finished",
      )
      roomRepository.build(room)

      await expect(() =>
        userService.adminEnterRoom({
          roomId,
          userId: normalUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
    })

    test("異常系_アーカイブされたroomに参加しようとするとエラーになる", async () => {
      const room = new RoomClass(
        roomId,
        "テストルーム",
        uuid(),
        "テスト用のルームです。",
        [1, 2].map((i) => ({ title: `テストトピック${i}` })),
        new Set([adminId]),
        "archived",
      )
      roomRepository.build(room)

      await expect(() =>
        userService.adminEnterRoom({
          roomId,
          userId: normalUserId,
          idToken: "",
        }),
      ).rejects.toThrow()
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
        new Set([adminUserId, normalUserId]),
      )
      roomRepository.build(room)

      userRepository.create(
        new User(adminUserId, true, false, roomId, adminUserIconId),
      )
      userRepository.create(
        new User(normalUserId, false, false, roomId, normalUserIconId),
      )
    })

    test("正常系_管理者ユーザーがroomから退出する", async () => {
      await userService.leaveRoom({ userId: adminUserId })

      const adminUser = await userRepository.find(adminUserId)

      // roomから退出したuserはfindで取得されない
      expect(adminUser).toBeNull()
    })

    test("正常系_一般ユーザーがroomから退出する", async () => {
      await userService.leaveRoom({ userId: normalUserId })

      const normalUser = await userRepository.find(normalUserId)

      // roomから退出したuserはfindで取得されない
      expect(normalUser).toBeNull()
    })
  })

  test("異常系_ roomに参加していないユーザーの場合、参加する前に通信が切断されてしまったと判断して何もしない", async () => {
    await expect(() => userService.leaveRoom({ userId: uuid() })).resolves
  })
})
