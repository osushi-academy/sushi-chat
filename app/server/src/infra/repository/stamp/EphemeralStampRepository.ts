import IStampRepository from "../../../domain/stamp/IStampRepository"
import Stamp from "../../../domain/stamp/Stamp"

class EphemeralStampRepository implements IStampRepository {
  private readonly stamps: Stamp[] = []

  public store(stamp: Stamp): void {
    this.stamps.push(stamp)
  }

  public count(
    roomId: string,
    topicId?: number,
    userId?: string,
  ): Promise<number> {
    let matched = this.stamps.filter((m) => m.roomId === roomId)

    if (topicId) {
      matched = matched.filter((m) => m.topicId === topicId)
    }

    if (userId) {
      matched = matched.filter((m) => m.userId === userId)
    }

    return Promise.resolve(matched.length)
  }

  public selectByRoomId(roomId: string): Promise<Stamp[]> {
    return Promise.resolve(this.stamps.filter((s) => s.roomId === roomId))
  }

  public selectByRoomIds(roomIds: string[]): Promise<Record<string, Stamp[]>> {
    return Promise.resolve(
      roomIds.reduce<Record<string, Stamp[]>>((acc, cur) => {
        acc[cur] = this.stamps.filter((s) => s.roomId === cur)
        return acc
      }, {}),
    )
  }
}

export default EphemeralStampRepository
