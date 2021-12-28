import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"
import { ArrayRange } from "../../../utils/range"
import IUserRepository from "../../../domain/user/IUserRepository"
import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import IStampRepository from "../../../domain/stamp/IStampRepository"
import Topic, { TopicTimeData } from "../../../domain/room/Topic"
import PGPool from "../PGPool"
import { RoomState, TopicState } from "sushi-chat-shared"
import IAdminRepository from "../../../domain/admin/IAdminRepository"
import User from "../../../domain/user/User"

class RoomRepository implements IRoomRepository {
  constructor(
    private readonly pgPool: PGPool,
    private readonly adminRepository: IAdminRepository,
    private readonly userRepository: IUserRepository,
    private readonly chatItemRepository: IChatItemRepository,
    private readonly stampRepository: IStampRepository,
  ) {}

  public async build(room: RoomClass) {
    const pgClient = await this.pgPool.client()

    const insertRoomQuery =
      "INSERT INTO rooms (id, room_state_id, title, invite_key, description) VALUES ($1, $2, $3, $4, $5)"

    // 挿入されるトピックの配列。クエリ発行の際に引数として渡すので変数に格納しておく
    const insertedTopics = room.topics.map((t) => [
      t.id,
      room.id,
      RoomRepository.topicStateMap["not-started"],
      t.title,
    ])
    const insertedColCnt = insertedTopics[0].length
    // 挿入されるトピックを埋め込む部分の文字列を作成
    // 例：($1, $2, $3, $4, $5, $6, $7, $8), ($9, $10, ...), ($17, ...), ...
    const insertedTopicsStr = ArrayRange(insertedTopics.length)
      .map(
        (i) =>
          `(${ArrayRange(insertedColCnt)
            .map((j) => `$${i * insertedColCnt + j + 1}`)
            .join(", ")})`,
      )
      .join(", ")
    const insertTopicsQuery = `INSERT INTO Topics (id, room_id, topic_state_id, title) VALUES ${insertedTopicsStr}`

    const creatorAdminId = room.adminIds.values().next().value
    if (!creatorAdminId) {
      throw new Error(`Admin who created room(${room.id}) is not set.`)
    }
    const insertRoomAdminQuery =
      "INSERT INTO rooms_admins (admin_id, room_id) VALUES ($1, $2)"
    const insertSystemUserQuery =
      "INSERT INTO users (id, room_id, icon_id, is_admin, is_system, has_left) VALUES ($1, $2, $3, $4, $5, $6)"

    try {
      // 依存先になるので先に作成
      await pgClient.query(insertRoomQuery, [
        room.id,
        RoomRepository.roomStateMap[room.state],
        room.title,
        room.adminInviteKey,
        room.description,
      ])
      await Promise.all([
        pgClient.query(insertTopicsQuery, insertedTopics.flat()),
        pgClient.query(insertRoomAdminQuery, [creatorAdminId, room.id]),
        pgClient.query(insertSystemUserQuery, [
          room.systemUser.id,
          room.id,
          room.systemUser.iconId,
          room.systemUser.isAdmin,
          room.systemUser.isSystem,
          false,
        ]),
      ])
    } catch (e) {
      RoomRepository.logError(e, "build()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async find(roomId: string): Promise<RoomClass | null> {
    const pgClient = await this.pgPool.client()

    const roomQuery =
      "SELECT r.title, r.room_state_id, r.invite_key, r.description, r.start_at, r.finish_at, r.archived_at, u.id as system_user_id  " +
      "FROM rooms r JOIN users u on u.is_system = true AND r.id = u.room_id  WHERE r.id = $1"
    const topicsQuery =
      "WITH topic as (" +
      "SELECT t.id, t.topic_state_id, t.title, t.offset_mil_sec, toa.opened_at_mil_sec, tpa.paused_at_mil_sec " +
      "FROM topics t " +
      "LEFT OUTER JOIN topic_opened_at toa on t.id = toa.topic_id AND t.room_id = toa.room_id " +
      "LEFT OUTER JOIN topic_paused_at tpa on t.id = tpa.topic_id AND t.room_id = tpa.room_id " +
      "WHERE t.room_id = $1" +
      ")" +
      "SELECT topic.id, topic.topic_state_id, topic.title, topic.offset_mil_sec, topic.opened_at_mil_sec, topic.paused_at_mil_sec, (" +
      "SELECT chat_item_id FROM topics_pinned_chat_items WHERE room_id = $1 AND topic_id = topic.id ORDER BY created_at DESC LIMIT 1" +
      ") as pinned_chat_item_id " +
      "FROM topic ORDER BY topic.id"

    try {
      const [roomRes, topicsRes, adminIds, users, stamps, chatItems] =
        await Promise.all([
          pgClient.query(roomQuery, [roomId]),
          pgClient.query(topicsQuery, [roomId]),
          this.adminRepository.selectIdsByRoomId(roomId),
          this.userRepository.selectByRoomId(roomId),
          this.stampRepository.selectByRoomId(roomId),
          this.chatItemRepository.selectByRoomId(roomId),
        ])

      if (roomRes.rowCount < 1) return null

      const room = roomRes.rows[0]
      const roomState = RoomRepository.intToRoomState(room.room_state_id)

      const topics: Topic[] = []
      const topicTimeData: Record<string, TopicTimeData> = {}
      for (const r of topicsRes.rows) {
        topics.push({
          id: r.id,
          title: r.title,
          state: RoomRepository.intToTopicState(r.topic_state_id),
          pinnedChatItemId: r.pinned_chat_item_id ?? undefined,
        })
        topicTimeData[r.id] = {
          openedDate: r.opened_at_mil_sec ?? null,
          pausedDate: r.paused_at_mil_sec ?? null,
          offsetTime: r.offset_mil_sec,
        }
      }

      const userIds = new Set<string>(users.map((u) => u.id))

      const systemUser = new User(
        room.system_user_id,
        false,
        true,
        roomId,
        User.SYSTEM_USER_ICON_ID,
      )

      return new RoomClass(
        roomId,
        room.title,
        room.invite_key,
        room.description,
        topics,
        new Set(adminIds),
        roomState,
        room.start_at,
        topicTimeData,
        room.finish_at,
        room.archived_at,
        userIds,
        chatItems,
        stamps,
        systemUser,
      )
    } catch (e) {
      RoomRepository.logError(e, "find()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async update(room: RoomClass) {
    const pgClient = await this.pgPool.client()

    const roomQuery =
      "UPDATE rooms SET room_state_id = $1, start_at = $2, finish_at = $3, archived_at = $4 WHERE id = $5"
    const updateRoom = async () => {
      await pgClient.query(roomQuery, [
        RoomRepository.roomStateMap[room.state],
        room.startAt,
        room.finishAt,
        room.archivedAt,
        new Date(),
        room.id,
      ])
    }

    // 例: '($2 $1), ($3, $1), ($4, $1), ...'
    const roomAdminValues = ArrayRange(room.adminIds.size)
      .map((i) => `($${i + 2}, $1)`)
      .join(", ")

    const roomAdminsQuery = `INSERT INTO rooms_admins (admin_id, room_id) VALUES ${roomAdminValues} ON CONFLICT (admin_id, room_id) DO NOTHING`
    const updateRoomAdmins = async () => {
      await pgClient.query(roomAdminsQuery, [room.id, ...room.adminIds])
    }

    const topicQuery =
      "UPDATE topics SET topic_state_id = $1, offset_mil_sec = $2, updated_at = $3 WHERE room_id = $4 AND id = $5"
    const updateTopic = async () => {
      await Promise.all(
        room.topics.map((t) =>
          pgClient.query(topicQuery, [
            RoomRepository.topicStateMap[t.state],
            room.topicTimeData[t.id].offsetTime,
            new Date(),
            room.id,
            t.id,
          ]),
        ),
      )
    }

    const openedAtQuery =
      "INSERT INTO topic_opened_at (topic_id, room_id, opened_at_mil_sec) VALUES($1, $2, $3) ON CONFLICT (topic_id, room_id) DO UPDATE SET opened_at_mil_sec = $3"
    const pausedAtQuery =
      "INSERT INTO topic_paused_at (topic_id, room_id, paused_at_mil_sec) VALUES($1, $2, $3) ON CONFLICT (topic_id, room_id) DO UPDATE SET paused_at_mil_sec = $3"
    const updateTopicTimeData = async () => {
      await Promise.all(
        Object.entries(room.topicTimeData).map(([topicId, timeData]) => {
          if (timeData.openedDate !== null) {
            pgClient
              .query(openedAtQuery, [topicId, room.id, timeData.openedDate])
              .catch(console.error)
          }
          if (timeData.pausedDate !== null) {
            pgClient
              .query(pausedAtQuery, [topicId, room.id, timeData.pausedDate])
              .catch(console.error)
          }
        }),
      )
    }

    try {
      // NOTE: 毎回全てのトピックのstateとtimeDataを更新しており、かつ複数クエリを発行しているので、
      //       パフォーマンスの問題が出てきたらここを疑う
      await Promise.all([
        updateRoom(),
        updateRoomAdmins(),
        updateTopic(),
        updateTopicTimeData(),
      ])
    } catch (e) {
      RoomRepository.logError(e, "update()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  private static readonly roomStateMap: Record<RoomState, number> = {
    "not-started": 1,
    ongoing: 2,
    finished: 3,
    archived: 4,
  }

  private static intToRoomState = (n: number): RoomState => {
    for (const [k, v] of Object.entries(RoomRepository.roomStateMap)) {
      if (v === n) return k as RoomState
    }

    throw new Error(`${n} is not assigned room-state int.`)
  }

  private static readonly topicStateMap: Record<TopicState, number> = {
    "not-started": 1,
    ongoing: 2,
    finished: 3,
    paused: 4,
  }

  private static intToTopicState = (n: number): TopicState => {
    for (const [k, v] of Object.entries(RoomRepository.topicStateMap)) {
      if (v === n) return k as TopicState
    }

    throw new Error(`${n} is not assigned topic-state int.`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static logError(error: any, context: string) {
    const datetime = new Date().toISOString()
    console.error(
      `[${datetime}] RoomRepository.${context}: ${error ?? "Unknown error."}`,
    )
  }
}

export default RoomRepository
