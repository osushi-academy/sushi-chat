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

  public async find(userId: string) {
    if (userId in Object.keys(this.users)) {
      return Promise.resolve(this.users[userId])
    } else {
      return Promise.resolve(null)
    }
  }

  public async selectByRoomId(roomId: string): Promise<User[]> {
    return Promise.resolve(
      Object.values(this.users).filter((u) => u.roomId === roomId),
    )
  }
}

export default EphemeralUserRepository
