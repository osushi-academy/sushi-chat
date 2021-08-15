import Stamp from "./Stamp"

interface IStampRepository {
  store(stamp: Stamp): void
  count(roomId: string, topicId: string, userId?: string): Promise<number>
}

export default IStampRepository
