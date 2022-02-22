import Admin from "./admin"
import { PoolClient } from "pg"

interface IAdminRepository {
  createIfNotExist(admin: Admin): void
  find(adminId: string): Promise<Admin | null>
  selectIdsByRoomId(roomId: string, pgClient: PoolClient): Promise<string[]>
}

export default IAdminRepository
