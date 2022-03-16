import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"

class EphemeralUserRepository implements IUserRepository {
  private users: User[] = []

  public create(user: User): void {
    this.users.push(user)
  }

  public async find(userId: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === userId) ?? null)
  }

  public async selectByRoomId(roomId: string): Promise<User[]> {
    return Promise.resolve(
      Object.values(this.users).filter((u) => u.roomId === roomId),
    )
  }

  public leaveRoom(user: User): void {
    this.users = this.users.filter((u) => u.id !== user.id)
  }

  public selectByRoomIds(roomIds: string[]): Promise<Record<string, User[]>> {
    return Promise.resolve(
      roomIds.reduce<Record<string, User[]>>((acc, cur) => {
        acc[cur] = this.users.filter((u) => u.roomId === cur)
        return acc
      }, {}),
    )
  }
}

export default EphemeralUserRepository
