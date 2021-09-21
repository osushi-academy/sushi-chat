import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"

class EphemeralUserRepository implements IUserRepository {
  private readonly users: Record<string, User> = {}

  public create(user: User): void {
    this.users[user.id] = user
  }

  public update(user: User): void {
    this.users[user.id] = user
  }

  public find(userId: string): User {
    return this.users[userId]
  }

  public delete(user: User): void {
    delete this.users[user.id]
  }

  public selectByRoomId(roomId: string): User[] {
    return [...Object.values(this.users).filter((u) => u.roomId === roomId)]
  }
}

export default EphemeralUserRepository
