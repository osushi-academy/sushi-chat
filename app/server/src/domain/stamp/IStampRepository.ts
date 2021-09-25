import Stamp from "./Stamp"

interface IStampRepository {
  store(stamp: Stamp): void
  count(roomId: string, topicId?: number, userId?: string): Promise<number>
  selectByRoomId(roomId: string): Promise<Stamp[]>
}

export default IStampRepository
