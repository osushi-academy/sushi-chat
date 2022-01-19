import { v4 as uuid } from "uuid"
import EphemeralRoomRepository from "../infra/repository/room/EphemeralRoomRepository"
import IRoomRepository from "../domain/room/IRoomRepository"
import RestRoomService from "../service/room/RestRoomService"
import RoomFactory from "../infra/factory/RoomFactory"
import Admin from "../domain/admin/admin"
import RoomClass from "../domain/room/Room"
import { PartiallyPartial } from "../types/utils"
import Topic from "../domain/room/Topic"
import { RoomModel, RoomState, Topic as TopicModel } from "sushi-chat-shared"
import EphemeralAdminRepository from "../infra/repository/admin/EphemeralAdminRepository"

describe("RestRoomServiceのテスト", () => {
  let admin: Admin

  let roomId: string
  let title: string
  let inviteKey: string
  let description: string
  let topics: PartiallyPartial<Topic, "id" | "state" | "pinnedChatItemId">[]
  let adminIds: Set<string>
  let startAt: Date
  let finishAt: Date

  let roomRepository: IRoomRepository
  let roomService: RestRoomService

  beforeEach(() => {
    const adminId = uuid()
    const adminName = "Admin"
    admin = new Admin(adminId, adminName, [])

    const adminRepository = new EphemeralAdminRepository()
    roomRepository = new EphemeralRoomRepository(adminRepository)
    const roomFactory = new RoomFactory()
    roomService = new RestRoomService(roomRepository, roomFactory)

    adminRepository.createIfNotExist(admin)

    roomId = uuid()
    title = "テストルーム"
    inviteKey = uuid()
    description = "テスト用のルームです"
    topics = [1, 2].map((i) => ({ title: `テストトピック${i}` }))
    adminIds = new Set([adminId])
    finishAt = new Date()
    // 現実に即して、startAtをfinishAtより少し前にしている
    startAt = new Date(finishAt.getTime() - 1000 * 60 * 60)
  })

  describe("buildのテスト", () => {
    test("正常系_roomが作成される", async () => {
      const res = await roomService.build({
        adminId: admin.id,
        title,
        topics,
        description,
      })

      const roomId = res.id

      const room = await roomRepository.find(roomId)
      if (!room) {
        throw new Error(`Room(${roomId}) was not found.`)
      }

      expect(room.title).toBe(title)
      expect(room.description).toBe(description)
      expect(room.topics).toStrictEqual<Topic[]>(
        topics.map((topic, i) => ({
          ...topic,
          id: i + 1,
          state: "not-started",
          pinnedChatItemId: undefined,
        })),
      )
    })
  })

  describe("startのテスト", () => {
    test("正常系_roomがstartする", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )

      // startされるroomを作成しておく
      roomRepository.build(room)

      expect(room.state).toBe<RoomState>("not-started")
      expect(room.startAt).toBeNull()

      await roomService.start({ id: roomId, adminId: admin.id })

      const startedRoom = await roomRepository.find(roomId)
      if (!startedRoom) {
        throw new Error(`Room(${roomId}) was not found.`)
      }

      expect(startedRoom.state).toBe<RoomState>("ongoing")
      expect(startedRoom.startAt).not.toBeNull()
    })

    test("異常系_存在しないroomはstartできない", async () => {
      const notExistRoomId = uuid()
      await expect(() =>
        roomService.start({ id: notExistRoomId, adminId: admin.id }),
      ).rejects.toThrow()
    })

    test("異常系_admin以外はstartできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )

      // startされるroomを作成しておく
      roomRepository.build(room)

      const notExistAdminId = uuid()
      await expect(() =>
        roomService.start({ id: roomId, adminId: notExistAdminId }),
      ).rejects.toThrow()
    })

    test("異常系_すでにstartしたroomはstartできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "ongoing",
      )

      // startされるroomを作成しておく
      roomRepository.build(room)

      await expect(
        roomService.start({ id: roomId, adminId: admin.id }),
      ).rejects.toThrow()
    })

    test("異常系_終了したroomはstartできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "finished",
      )

      // startされるroomを作成しておく
      roomRepository.build(room)

      await expect(
        roomService.start({ id: roomId, adminId: admin.id }),
      ).rejects.toThrow()
    })

    test("異常系_archiveしたroomはstartできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "archived",
      )

      // startされるroomを作成しておく
      roomRepository.build(room)

      await expect(
        roomService.start({ id: roomId, adminId: admin.id }),
      ).rejects.toThrow()
    })
  })

  describe("inviteAdminのテスト", () => {
    test("正常系_新たな管理者が登録される", async () => {
      // 管理者が登録されるroomを作成しておく
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )
      roomRepository.build(room)

      expect(room.adminIds.size).toBe(1)

      const anotherAdminId = uuid()
      await roomService.inviteAdmin({
        id: roomId,
        adminId: anotherAdminId,
        adminInviteKey: inviteKey,
      })

      const invitedRoom = await roomRepository.find(roomId)
      if (!invitedRoom) {
        throw new Error(`Room(${roomId}) was not found.`)
      }

      expect(invitedRoom.adminIds.size).toBe(2)
      expect(invitedRoom.adminIds.has(anotherAdminId)).toBeTruthy()
    })

    test("異常系_存在しないroomにはinviteできない", async () => {
      const notExistRoomId = uuid()
      const anotherAdminId = uuid()

      await expect(() =>
        roomService.inviteAdmin({
          id: notExistRoomId,
          adminId: anotherAdminId,
          adminInviteKey: inviteKey,
        }),
      ).rejects.toThrow()
    })

    test("異常系_不正なinviteKeyではinviteできない", async () => {
      const anotherAdminId = uuid()
      const invalidInviteKey = uuid()

      await expect(() =>
        roomService.inviteAdmin({
          id: roomId,
          adminId: anotherAdminId,
          adminInviteKey: invalidInviteKey,
        }),
      ).rejects.toThrow()
    })
  })

  describe("archiveのテスト", () => {
    test("正常系_roomがarchiveされる", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "finished",
        startAt,
        [],
        finishAt,
      )
      roomRepository.build(room)

      expect(room.state).toBe<RoomState>("finished")
      expect(room.archivedAt).toBeNull()

      await roomService.archive({ id: roomId, adminId: admin.id })

      expect(room.state).toBe<RoomState>("archived")
      expect(room.archivedAt).not.toBeNull()
    })

    test("異常系_存在しないRoomはarchiveできない", async () => {
      const notExistRoomId = uuid()
      await expect(() =>
        roomService.archive({ id: notExistRoomId, adminId: admin.id }),
      ).rejects.toThrow()
    })

    test("異常系_admin以外はarchiveできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "finished",
        startAt,
        [],
        finishAt,
      )
      roomRepository.build(room)

      const notExistAdminId = uuid()
      await expect(() =>
        roomService.archive({ id: roomId, adminId: notExistAdminId }),
      ).rejects.toThrow()
    })

    test("異常系_startしていないroomはarchiveできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "not-started",
        startAt,
        [],
        finishAt,
      )
      roomRepository.build(room)

      await expect(() =>
        roomService.archive({ id: roomId, adminId: admin.id }),
      ).rejects.toThrow()
    })

    test("異常系_進行中のroomはarchiveできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "ongoing",
        startAt,
        [],
        finishAt,
      )
      roomRepository.build(room)

      await expect(() =>
        roomService.archive({ id: roomId, adminId: admin.id }),
      ).rejects.toThrow()
    })

    test("異常系_すでにarchiveされたroomはarchiveできない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
        "archived",
        startAt,
        [],
        finishAt,
      )
      roomRepository.build(room)

      await expect(() =>
        roomService.archive({ id: roomId, adminId: admin.id }),
      ).rejects.toThrow()
    })
  })

  describe("checkAdminAndFindのテスト", () => {
    test("正常系_非管理者ユーザーが秘匿でないroom情報をを取得できる", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )
      roomRepository.build(room)

      const res = await roomService.checkAdminAndfind({
        id: roomId,
      })

      expect(res).toStrictEqual<RoomModel>({
        id: roomId,
        title,
        description,
        topics: topics.map<TopicModel>((topic, i) => ({
          id: i + 1,
          order: i + 1,
          title: topic.title,
        })),
        state: "not-started",
        adminInviteKey: undefined,
        startDate: undefined,
      })
    })

    test("正常系_管理者ユーザーが秘匿情報も含めたroom情報をを取得できる", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )
      roomRepository.build(room)

      const res = await roomService.checkAdminAndfind({
        id: roomId,
        adminId: admin.id,
      })

      expect(res).toStrictEqual<RoomModel>({
        id: roomId,
        title,
        description,
        topics: topics.map<TopicModel>((topic, i) => ({
          id: i + 1,
          order: i + 1,
          title: topic.title,
        })),
        state: "not-started",
        adminInviteKey: inviteKey,
        startDate: undefined,
      })
    })

    test("異常系_不正なuserIdが渡されても秘匿情報を返さない", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )
      roomRepository.build(room)

      const notExistAdminId = uuid()
      const res = await roomService.checkAdminAndfind({
        id: roomId,
        adminId: notExistAdminId,
      })

      expect(res).toStrictEqual<RoomModel>({
        id: roomId,
        title,
        description,
        topics: topics.map<TopicModel>((topic, i) => ({
          id: i + 1,
          order: i + 1,
          title: topic.title,
        })),
        state: "not-started",
        adminInviteKey: undefined,
        startDate: undefined,
      })
    })

    test("異常系_存在しないroomの情報は取得できない", async () => {
      const notExistRoomId = uuid()
      await expect(() =>
        roomService.checkAdminAndfind({ id: notExistRoomId }),
      ).rejects.toThrow()
    })
  })

  describe("findのテスト", () => {
    test("正常系_roomの履歴を取得できる", async () => {
      const room = new RoomClass(
        roomId,
        title,
        inviteKey,
        description,
        topics,
        adminIds,
      )
      roomRepository.build(room)

      const res = await roomService.find(roomId)

      expect(res.chatItems).toStrictEqual([])
      expect(res.stamps).toStrictEqual([])
      expect(res.pinnedChatItemIds).toStrictEqual([1, 2].map(() => null))
    })

    test("異常系_存在しないroomの履歴は取得できない", async () => {
      const notExistRoomId = uuid()
      await expect(() => roomService.find(notExistRoomId)).rejects.toThrow()
    })
  })
})
