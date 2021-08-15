import RoomClass from "./Room"

interface IRoomRepository {
  find(roomId: string): RoomClass | null
  build(room: RoomClass): void
  update(room: RoomClass): void
}

export default IRoomRepository
