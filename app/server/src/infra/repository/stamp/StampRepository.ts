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
        `${e.message ?? "Unknown error."} (SAVE ROOM(${
          stamp.roomId
        })/STAMP(userId: ${stamp.userId}, roomId: ${stamp.roomId}, topicId: ${
          stamp.topicId
        }) IN DB)`,
        new Date().toISOString(),
      )

      throw e
    }
  }
}

export default StampRepository
