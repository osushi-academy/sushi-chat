import { v4 as uuid } from "uuid"
import AdminService from "../service/admin/AdminService"
import IRoomRepository from "../domain/room/IRoomRepository"
import EphemeralAdminRepository from "../infra/repository/admin/EphemeralAdminRepository"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import MockAdminAuth from "../infra/auth/MockAdminAuth"
import Admin from "../domain/admin/admin"
import RoomClass from "../domain/room/Room"
import { RoomState } from "sushi-chat-shared"
import Topic from "../domain/room/Topic"

describe("AdminServiceのテスト", () => {
  let admin: Admin

  let adminRepository: EphemeralAdminRepository
  let roomRepository: IRoomRepository

  let adminService: AdminService

  beforeEach(() => {
    const adminId = uuid()
    const adminName = "Admin"
    admin = new Admin(adminId, adminName, [])

    adminRepository = new EphemeralAdminRepository()
    roomRepository = new EphemeralRoomRepository(adminRepository)
    const adminAuth = new MockAdminAuth({ id: adminId, name: adminName })

    adminService = new AdminService(adminRepository, roomRepository, adminAuth)
  })

  describe("verifyTokenのテスト", () => {
    test("正常系_検証して得られたadminが未登録なら登録される", async () => {
      expect(adminRepository.admins).toHaveLength(0)

      const dummyToken = ""
      await adminService.verifyToken(dummyToken)

      expect(adminRepository.admins).toHaveLength(1)
      const newAdmin = await adminRepository.find(admin.id)
      if (!newAdmin) {
        throw new Error(`Admin(${admin.id}) was not found.`)
      }
      expect(newAdmin.id).toBe(admin.id)
      expect(newAdmin.name).toBe(admin.name)
      expect(newAdmin.managedRoomsIds).toStrictEqual([])
    })

    test("正常系_検証して得られたadminが既に登録済みならデータは追加されない", async () => {
      // adminが既に登録されている状態にしておく
      adminRepository.createIfNotExist(admin)

      expect(adminRepository.admins).toHaveLength(1)

      const dummyToken = ""
      await adminService.verifyToken(dummyToken)

      expect(adminRepository.admins).toHaveLength(1)
    })
  })

  describe("getManagedRoomsのテスト", () => {
    test("正常系_管理しているroom一覧を取得する", async () => {
      // adminが既に登録されている状態にしておく
      adminRepository.createIfNotExist(admin)

      // `admin`が管理者であるroomを作成
      const roomIds = [uuid(), uuid()]
      const inviteKeys = [uuid(), uuid()]
      const rooms = [1, 2].map(
        (i) =>
          new RoomClass(
            roomIds[i - 1],
            `room${i}`,
            inviteKeys[i - 1],
            `This is room${i}.`,
            [{ title: `topic${i}-1` }],
            new Set([admin.id]),
          ),
      )
      rooms.forEach((r) => roomRepository.build(r))

      // `admin`が管理者でないroomを作成
      const notManagingAdminId = uuid()
      adminRepository.createIfNotExist(
        new Admin(notManagingAdminId, "not-managing-admin", []),
      )
      roomRepository.build(
        new RoomClass(
          uuid(),
          "not-managed-room",
          uuid(),
          "This is not managed room.",
          [{ title: "not-managed-room-topic" }],
          new Set([notManagingAdminId]),
        ),
      )

      const managedRooms = await adminService.getManagedRooms({
        adminId: admin.id,
      })
      expect(managedRooms).toHaveLength(rooms.length)
      managedRooms.forEach((r, i) => {
        expect(r.id).toBe(roomIds[i])
        expect(r.title).toBe(`room${i + 1}`)
        expect(r.description).toBe(`This is room${i + 1}.`)
        expect(r.topics).toStrictEqual<Topic[]>([
          {
            id: 1,
            title: `topic${i + 1}-1`,
            state: "not-started",
            pinnedChatItemId: undefined,
          },
        ])
        expect(r.state).toBe<RoomState>("not-started")
        expect(r.adminInviteKey).toBe(inviteKeys[i])
        expect(r.startAt).toBeNull()
      })
    })
  })
})
