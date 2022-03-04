import Admin from "./admin"
import { PoolClient } from "pg"

interface IAdminRepository {
  createIfNotExist(admin: Admin): void
  find(adminId: string): Promise<Admin | null>
  selectIdsByRoomId(roomId: string, pgClient: PoolClient): Promise<string[]>
  selectIdsByRoomIds(
    roomIds: string[],
    pgClient?: PoolClient, // TODO: remove this arg to avoid appearing of implementation detail in interface
  ): Promise<Record<string, string[]>> // adminIds per room
}

export default IAdminRepository
