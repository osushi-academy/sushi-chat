import IStampRepository from "../../../domain/stamp/IStampRepository"
import PGClientFactory from "../../factory/PGClientFactory"
import Stamp from "../../../domain/stamp/Stamp"

class StampRepository implements IStampRepository {
  private readonly pgClient = PGClientFactory.create()

  public async store(stamp: Stamp): Promise<void> {
    try {
      const query = `INSERT INTO Stamps (roomId, topicId, userId, timestamp) VALUES ($1, $2, $3, $4)`
      await this.pgClient.query(query, [
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
    }
  }

  public async count(
    roomId: string,
    topicId: string,
    userId?: string,
  ): Promise<number> {
    try {
      const query =
        "SELECT COUNT(*) FROM stamps WHERE roomid = $1 AND topicid = $2" +
        userId
          ? " AND userid = $3"
          : ""
      return (
        await this.pgClient.query(
          query,
          userId ? [roomId, topicId, userId] : [roomId, topicId],
        )
      ).rows[0].count as number
    } catch (e) {
      console.error(
        `${e.message ?? "Unknown error."} (COUNT STAMP(${
          userId && "userId: " + userId + ", "
        }roomId: ${roomId}, topicId: ${topicId}) IN DB)`,
        new Date().toISOString(),
      )

      throw e
    }
  }
}

export default StampRepository
