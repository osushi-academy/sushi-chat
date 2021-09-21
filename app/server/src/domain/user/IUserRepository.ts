import User from "./User"

interface IUserRepository {
  create(user: User): void
  update(user: User): void
  find(userId: string): User
  leaveRoom(user: User): void
  selectByRoomId(roomId: string): User[]
}

export default IUserRepository
