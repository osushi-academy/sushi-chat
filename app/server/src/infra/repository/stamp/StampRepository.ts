import IStampRepository from "../../../domain/stamp/IStampRepository"
import Stamp from "../../../domain/stamp/Stamp"
import { Pool } from "pg"

class StampRepository implements IStampRepository {
  constructor(private readonly pgPool: Pool) {}

  public async store(stamp: Stamp): Promise<void> {
    const pgClient = await this.pgPool.connect()

    const query = `INSERT INTO Stamps (roomId, topicId, userId, timestamp) VALUES ($1, $2, $3, $4)`

    try {
      await pgClient.query(query, [
        stamp.roomId,
        stamp.topicId,
        stamp.userId,
        stamp.timestamp,
      ])
    } catch (e) {
      console.error(
        `${e.message ?? "Unknown error."} (SAVE STAMP(userId: ${
          stamp.userId
        }, roomId: ${stamp.roomId}, topicId: ${stamp.topicId}))`,
        new Date().toISOString(),
      )

      throw e
    } finally {
      pgClient.release()
    }
  }

  public async count(
    roomId: string,
    topicId?: string,
    userId?: string,
  ): Promise<number> {
    const pgClient = await this.pgPool.connect()

    let query = "SELECT COUNT(*) FROM stamps WHERE roomid = $1"
    const values = [roomId]
    if (topicId) {
      query += " AND topicid = $2"
      values.push(topicId)
    }
    if (userId) {
      query += " AND userid = $3"
      values.push(userId)
    }

    const res = await pgClient
      .query(query, values)
      .catch((e) => {
        console.error(
          `${e.message ?? "Unknown error."} (COUNT STAMP(${
            userId && "userId: " + userId + ", "
          }roomId: ${roomId}, topicId: ${topicId}) IN DB)`,
          new Date().toISOString(),
        )
        throw e
      })
      .finally(pgClient.release)

    return res.rows[0].count as number
  }
}

export default StampRepository
