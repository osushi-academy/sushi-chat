import User from "./User"

interface IUserRepository {
  create(user: User): void
  update(user: User): void
  find(userId: string): Promise<User | null>
  selectByRoomId(roomId: string): Promise<User[]>
}

export default IUserRepository
