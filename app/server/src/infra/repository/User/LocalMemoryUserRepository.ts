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

  public create(user: User): void {
    this.users[user.id] = user
  }

  public update(user: User): void {
    this.users[user.id] = user
  }

  public async find(userId: string): Promise<User> {
    return Promise.resolve(this.users[userId])
  }

  public async selectByRoomId(roomId: string): Promise<User[]> {
    return Promise.resolve(
      Object.values(this.users).filter((u) => u.roomId === roomId),
    )
  }
}

export default LocalMemoryUserRepository
