import Stamp from "./Stamp"
import { PoolClient } from "pg"

interface IStampRepository {
  store(stamp: Stamp): void
  count(roomId: string, topicId?: number, userId?: string): Promise<number>
  selectByRoomId(roomId: string, pgClient: PoolClient): Promise<Stamp[]>
  selectByRoomIds(
    roomIds: string[],
    pgClient?: PoolClient, // TODO: remove this arg to avoid appearing of implementation detail in interface
  ): Promise<Record<string, Stamp[]>> // stamps per room
}

export default IStampRepository
