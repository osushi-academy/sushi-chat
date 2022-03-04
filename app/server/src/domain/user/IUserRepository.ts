import User from "./User"
import { PoolClient } from "pg"

interface IUserRepository {
  create(user: User): void
  find(userId: string): Promise<User | null>
  selectByRoomId(roomId: string, pgClient: PoolClient): Promise<User[]>
  selectByRoomIds(
    roomIds: string[],
    pgClient?: PoolClient, // TODO: remove this arg to avoid appearing of implementation detail in interface
  ): Promise<Record<string, User[]>> // users per room
  leaveRoom(user: User): void
}

export default IUserRepository
