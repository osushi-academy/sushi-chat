import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"
import { ArrayRange } from "../../../utils/range"
import IUserRepository from "../../../domain/user/IUserRepository"
import IChatItemRepository from "../../../domain/chatItem/IChatItemRepository"
import IStampRepository from "../../../domain/stamp/IStampRepository"
import Topic, { TopicTimeData } from "../../../domain/room/Topic"
import { TopicState } from "sushi-chat-front/models/contents"
import PGPool from "../PGPool"

class RoomRepository implements IRoomRepository {
  constructor(
    private readonly pgPoo: PGPool,
    private readonly userRepository: IUserRepository,
    private readonly chatItemRepository: IChatItemRepository,
    private readonly stampRepository: IStampRepository,
  ) {}

  public async build(room: RoomClass): Promise<void> {
    const pgClient = await this.pgPoo.client()

    try {
      const insertRoomQuery =
        "INSERT INTO Rooms (id, roomKey, title, status) VALUES ($1, '', $2, 0)"
      await pgClient.query(insertRoomQuery, [room.id, room.title])

      const values = room.topics.map((t) => [
        t.id,
        room.id,
        t.title,
        t.description ?? "",
        0,
        t.urls.github,
        t.urls.slide,
        t.urls.product,
      ])
      const valuesStr = ArrayRange(values.length)
        .map(
          (i) =>
            `(${ArrayRange(8)
              .map((j) => `$${i * 8 + j + 1}`)
              .join(", ")})`,
        )
        .join(", ")
      const insertTopicsQuery = `INSERT INTO Topics (id, roomId, title, description, state, githuburl, slideurl,producturl) VALUES ${valuesStr}`
      await pgClient.query(insertTopicsQuery, values.flat())
    } catch (e) {
      console.error(
        `${
          e.message ?? "Unknown error."
        } (SAVE ROOM/TOPIC IN DB) ${new Date().toISOString()}`,
      )
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async find(roomId: string): Promise<RoomClass> {
    const pgClient = await this.pgPoo.client()

    const roomQuery = "SELECT title, status FROM rooms WHERE id = $1"
    const topicsQuery =
      "SELECT t.id, t.title, t.description, t.githuburl, t.slideurl, t.producturl, t.state, t.offset_mil_sec, toa.opened_at_mil_sec, tpa.paused_at_mil_sec " +
      "FROM topics t " +
      "LEFT OUTER JOIN topic_opened_at toa on t.id = toa.topic_id AND t.roomid = toa.room_id " +
      "LEFT OUTER JOIN topic_paused_at tpa on t.id = tpa.topic_id AND t.roomid = tpa.room_id " +
      "WHERE t.roomid = $1 " +
      "ORDER BY t.id"

    const [roomRes, topicsRes, users, stampsCount, chatItems] =
      await Promise.all([
        pgClient.query(roomQuery, [roomId]),
        pgClient.query(topicsQuery, [roomId]),
        this.userRepository.selectByRoomId(roomId),
        this.stampRepository.count(roomId),
        this.chatItemRepository.selectByRoomId(roomId),
      ]).finally(pgClient.release)

    const roomTitle: string = roomRes.rows[0].title
    const roomIsOpen = roomRes.rows[0].status === 1
    const topics: Topic[] = []
    const topicTimeData: Record<string, TopicTimeData> = {}
    for (const r of topicsRes.rows) {
      const id = `${r.id}`
      topics.push({
        id,
        title: r.title,
        description: r.description,
        urls: {
          github: r.githuburl,
          slide: r.slideurl,
          product: r.producturl,
        },
        state: RoomRepository.intToTopicState(r.state),
      })
      topicTimeData[id] = {
        openedDate: r.opened_at_mil_sec ?? null,
        pausedDate: r.paused_at_mil_sec ?? null,
        offsetTime: r.offset_mil_sec,
      }
    }

    const userIds = new Set<string>(users.map((u) => u.id))

    return new RoomClass(
      roomId,
      roomTitle,
      topics,
      topicTimeData,
      userIds,
      chatItems,
      stampsCount,
      roomIsOpen,
    )
  }

  public async update(room: RoomClass) {
    const pgClient = await this.pgPoo.client()

    try {
      const roomQuery = "UPDATE rooms SET status = $1 WHERE id = $2"
      await pgClient.query(roomQuery, [room.isOpened ? 1 : 0, room.id])

      // NOTE: 毎回全てのトピックのstateとtimeDataを更新しており、かつ複数クエリを発行しているので、パフォーマンスの問題が出てきたらここを疑う
      for (const t of room.topics) {
        const topicQuery =
          "UPDATE topics SET state = $1, offset_mil_sec = $2 WHERE roomid = $3 AND id = $4"
        await pgClient
          .query(topicQuery, [
            RoomRepository.topicStateMap[t.state],
            room.topicTimeData[t.id].offsetTime,
            room.id,
            t.id,
          ])
          .catch((e) => console.error(e))
      }

      for (const [topicId, timeData] of Object.entries(room.topicTimeData)) {
        if (timeData.openedDate !== null) {
          const openedAtQuery =
            "INSERT INTO topic_opened_at (topic_id, room_id, opened_at_mil_sec) VALUES($1, $2, $3) " +
            "ON CONFLICT (topic_id, room_id) DO UPDATE SET opened_at_mil_sec = $3"
          await pgClient.query(openedAtQuery, [
            topicId,
            room.id,
            timeData.openedDate,
          ])
        }
        if (timeData.pausedDate !== null) {
          const pausedAtQuery =
            "INSERT INTO topic_paused_at (topic_id, room_id, paused_at_mil_sec) VALUES($1, $2, $3) " +
            "ON CONFLICT (topic_id, room_id) DO UPDATE SET paused_at_mil_sec = $3"
          await pgClient.query(pausedAtQuery, [
            topicId,
            room.id,
            timeData.pausedDate,
          ])
        }
      }
    } finally {
      pgClient.release()
    }
  }

  private static readonly topicStateMap: Record<TopicState, number> = {
    "not-started": 0,
    active: 1,
    paused: 2,
    finished: 3,
  }

  private static intToTopicState = (n: number): TopicState => {
    for (const [k, v] of Object.entries(RoomRepository.topicStateMap)) {
      if (v === n) return k as TopicState
    }

    throw new Error(`${n} is not assigned topic-state int.`)
  }
}

export default RoomRepository
