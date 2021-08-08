import User from "./User"

interface IUserRepository {
  create(user: User): void
  update(user: User): void
  find(userId: string): User
}

export default IUserRepository
