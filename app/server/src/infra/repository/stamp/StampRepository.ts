import IStampRepository from "../../../domain/stamp/IStampRepository"
import Stamp from "../../../domain/stamp/Stamp"
import PGPool from "../PGPool"

class StampRepository implements IStampRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async store(stamp: Stamp) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO Stamps (id, room_id, topic_id, user_id, timestamp, created_at) VALUES ($1, $2, $3, $4, $5, $6)"

    try {
      await pgClient.query(query, [
        stamp.id,
        stamp.roomId,
        stamp.topicId,
        stamp.userId,
        stamp.timestamp,
        stamp.createdAt,
      ])
    } finally {
      pgClient.release()
    }
  }

  public async count(
    roomId: string,
    topicId?: number,
    userId?: string,
  ): Promise<number> {
    const pgClient = await this.pgPool.client()

    let query = "SELECT COUNT(*) FROM stamps WHERE room_id = $1"
    const values: unknown[] = [roomId]
    if (topicId) {
      query += " AND topic_id = $2"
      values.push(topicId)
    }
    if (userId) {
      query += " AND user_id = $3"
      values.push(userId)
    }

    try {
      const res = await pgClient.query(query, values)
      return res.rows[0].count as number
    } finally {
      pgClient.release()
    }
  }

  public async selectByRoomId(roomId: string): Promise<Stamp[]> {
    const pgClient = await this.pgPool.client()

    const query =
      "SELECT id, topic_id, user_id, created_at, timestamp FROM stamps WHERE room_id = $1"
    try {
      const res = await pgClient.query(query, [roomId])
      return res.rows.map((r) => {
        return new Stamp(
          r.id,
          r.user_id,
          roomId,
          r.topic_id,
          r.created_at,
          r.timestamp,
        )
      })
    } finally {
      pgClient.release()
    }
  }
}

export default StampRepository
