import Stamp from "./Stamp"
import { PoolClient } from "pg"

interface IStampRepository {
  store(stamp: Stamp): void
  count(roomId: string, topicId?: number, userId?: string): Promise<number>
  selectByRoomId(roomId: string, pgClient: PoolClient): Promise<Stamp[]>
}

export default IStampRepository
