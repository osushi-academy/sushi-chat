import RoomClass from "./Room"

interface IRoomRepository {
  find(roomId: string): Promise<RoomClass | null>
  build(room: RoomClass): void
  update(room: RoomClass): void
}

export default IRoomRepository
