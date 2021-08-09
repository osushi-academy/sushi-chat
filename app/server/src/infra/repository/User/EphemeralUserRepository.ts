import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"

class EphemeralUserRepository implements IUserRepository {
  private readonly users: Record<string, User> = {}

  create(user: User): void {
    this.users[user.id] = user
  }

  update(user: User): void {
    this.users[user.id] = user
  }

  find(userId: string): User {
    return this.users[userId]
  }
}

export default EphemeralUserRepository
