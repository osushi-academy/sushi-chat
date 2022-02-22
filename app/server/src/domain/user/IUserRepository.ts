import User from "./User"
import { PoolClient } from "pg"

interface IUserRepository {
  create(user: User): void
  find(userId: string): Promise<User | null>
  selectByRoomId(roomId: string, pgClient: PoolClient): Promise<User[]>
  leaveRoom(user: User): void
}

export default IUserRepository
