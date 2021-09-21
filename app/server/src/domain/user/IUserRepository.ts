import User from "./User"

interface IUserRepository {
  create(user: User): void
  find(userId: string): Promise<User | null>
  selectByRoomId(roomId: string): Promise<User[]>
  leaveRoom(user: User): void
}

export default IUserRepository
