import User from "./User"

interface IUserRepository {
  create(user: User): void
  update(user: User): void
  find(userId: string): User
  selectByRoomId(roomId: string): User[]
}

export default IUserRepository
