import IStampRepository from "../../../domain/stamp/IStampRepository"
import Stamp from "../../../domain/stamp/Stamp"

class EphemeralStampRepository implements IStampRepository {
  private readonly stamps: Stamp[] = []

  public store(stamp: Stamp): void {
    this.stamps.push(stamp)
  }

  public count(
    roomId: string,
    topicId: string,
    userId?: string,
  ): Promise<number> {
    let matched = this.stamps.filter(
      (m) => m.roomId === roomId && m.topicId === topicId,
    )
    if (userId) {
      matched = matched.filter((m) => m.userId === userId)
    }

    return Promise.resolve(matched.length)
  }
}

export default EphemeralStampRepository
