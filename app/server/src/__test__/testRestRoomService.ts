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
  let emojiTitle: string
  let longLimitTitle: string
  let unacceptableLongTitle: string
  let inviteKey: string
  let description: string
  let longLimitDescription: string
  let unacceptableLongDescription: string
  let topics: PartiallyPartial<Topic, "id" | "state" | "pinnedChatItemId">[]
  let longLimitTitleTopics: PartiallyPartial<
    Topic,
    "id" | "state" | "pinnedChatItemId"
  >[]
  let unacceptableLongTitleTopics: PartiallyPartial<
    Topic,
    "id" | "state" | "pinnedChatItemId"
  >[]
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
    // 短め
    title = "親譲りの無鉄砲"
    // 改行されるのでわざと分けている
    emojiTitle =
      "🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️" + "🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️" + "🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️"
    // 100文字
    longLimitTitle =
      "親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階か🤷‍♂️"
    // 101文字
    unacceptableLongTitle =
      "親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首"
    inviteKey = uuid()
    // 短め
    description = "親譲りの無鉄砲で小供の時から損ばかりしている。"
    // 500文字
    longLimitDescription =
      "親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首を出していたら、同級生の一人が冗談に、いくら威張っても、そこから飛び降りる事は出来まい。弱虫やーい。と囃したからである。小使に負ぶさって帰って来た時、おやじが大きな眼をして二階ぐらいから飛び降りて腰を抜かす奴があるかと云ったから、この次は抜かさずに飛んで見せますと答えた。（青空文庫より）親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首を出していたら、同級生の一人が冗談に、いくら威張っても、そこから飛び降りる事は出来まい。弱虫やーい。と囃したからである。小使に負ぶさって帰って来た時、おやじが大きな眼をして二階ぐらいから飛び降りて腰を抜かす奴があるかと云ったから、この次は抜かさずに飛んで見せますと答えた。（青空文庫より）親譲りの無鉄砲で小🤷‍♂️"
    // 501文字
    unacceptableLongDescription =
      "親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首を出していたら、同級生の一人が冗談に、いくら威張っても、そこから飛び降りる事は出来まい。弱虫やーい。と囃したからである。小使に負ぶさって帰って来た時、おやじが大きな眼をして二階ぐらいから飛び降りて腰を抜かす奴があるかと云ったから、この次は抜かさずに飛んで見せますと答えた。（青空文庫より）親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首を出していたら、同級生の一人が冗談に、いくら威張っても、そこから飛び降りる事は出来まい。弱虫やーい。と囃したからである。小使に負ぶさって帰って来た時、おやじが大きな眼をして二階ぐらいから飛び降りて腰を抜かす奴があるかと云ったから、この次は抜かさずに飛んで見せますと答えた。（青空文庫より）親譲りの無鉄砲で小供の"
    // 短め
    topics = [1, 2].map((i) => ({
      title: `テストトピック${i}`,
    }))
    // 100文字
    longLimitTitleTopics = [1, 2].map((i) => ({
      title: `テストトピック${i}親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもな🤷‍♂️`,
    }))
    // 101文字
    unacceptableLongTitleTopics = [1, 2].map((i) => ({
      title: `テストトピック${i}親譲りの無鉄砲で小供の時から損ばかりしている。小学校に居る時分学校の二階から飛び降りて一週間ほど腰を抜かした事がある。なぜそんな無闇をしたと聞く人があるかも知れぬ。別段深い理由でもない。新築の二階から首`,
    }))
    adminIds = new Set([adminId])
    finishAt = new Date()
    // 現実に即して、startAtをfinishAtより少し前にしている
    startAt = new Date(finishAt.getTime() - 1000 * 60 * 60)
  })

  describe("buildのテスト", () => {
    test("正常系_ルーム名、トピック、説明が短文ののroomが作成される", async () => {
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

    test("正常系_絵文字で100文字未満のルームタイトルの時roomが作成される", async () => {
      const res = await roomService.build({
        adminId: admin.id,
        title: emojiTitle,
        topics,
        description,
      })

      const roomId = res.id

      const room = await roomRepository.find(roomId)
      if (!room) {
        throw new Error(`Room(${roomId}) was not found.`)
      }

      expect(room.title).toBe(emojiTitle)
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

    test("正常系_サロゲートペア絵文字込で100文字のルームタイトルの時roomが作成される", async () => {
      const res = await roomService.build({
        adminId: admin.id,
        title: longLimitTitle,
        topics,
        description,
      })

      const roomId = res.id

      const room = await roomRepository.find(roomId)
      if (!room) {
        throw new Error(`Room(${roomId}) was not found.`)
      }

      expect(room.title).toBe(longLimitTitle)
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

    test("異常系_100文字を超えるルームタイトルの時roomが作成されない", async () => {
      await expect(() =>
        roomService.build({
          adminId: admin.id,
          title: unacceptableLongTitle,
          topics,
          description,
        }),
      ).rejects.toThrowError()
    })

    test("正常系_500文字のルーム説明の時roomが作成される", async () => {
      const res = await roomService.build({
        adminId: admin.id,
        title,
        topics,
        description: longLimitDescription,
      })

      const roomId = res.id

      const room = await roomRepository.find(roomId)
      if (!room) {
        throw new Error(`Room(${roomId}) was not found.`)
      }

      expect(room.title).toBe(title)
      expect(room.description).toBe(longLimitDescription)
      expect(room.topics).toStrictEqual<Topic[]>(
        topics.map((topic, i) => ({
          ...topic,
          id: i + 1,
          state: "not-started",
          pinnedChatItemId: undefined,
        })),
      )
    })

    test("異常系_500文字を超えるルーム説明の時roomが作成されない", async () => {
      await expect(() =>
        roomService.build({
          adminId: admin.id,
          title,
          topics,
          description: unacceptableLongDescription,
        }),
      ).rejects.toThrowError()
    })

    test("正常系_100文字のトピックタイトルの時roomが作成される", async () => {
      const res = await roomService.build({
        adminId: admin.id,
        title,
        topics: longLimitTitleTopics,
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
        longLimitTitleTopics.map((topic, i) => ({
          ...topic,
          id: i + 1,
          state: "not-started",
          pinnedChatItemId: undefined,
        })),
      )
    })

    test("異常系_100文字を超えるトピックタイトルの時roomが作成されない", async () => {
      await expect(() =>
        roomService.build({
          adminId: admin.id,
          title,
          topics: unacceptableLongTitleTopics,
          description,
        }),
      ).rejects.toThrowError()
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
