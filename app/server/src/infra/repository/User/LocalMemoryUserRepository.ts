import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"

class LocalMemoryUserRepository implements IUserRepository {
  private static instance: LocalMemoryUserRepository
  public static getInstance(): LocalMemoryUserRepository {
    if (!this.instance) {
      this.instance = new LocalMemoryUserRepository()
    }
    return this.instance
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

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

export default LocalMemoryUserRepository
