import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"

class LocalMemoryRoomRepository implements IRoomRepository {
  private static instance: LocalMemoryRoomRepository
  public static getInstance(): LocalMemoryRoomRepository {
    if (!this.instance) {
      this.instance = new LocalMemoryRoomRepository()
    }
    return this.instance
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private readonly rooms: Record<string, RoomClass> = {}

  public build(room: RoomClass): void {
    this.rooms[room.id] = room
  }

  public find(roomId: string): RoomClass {
    return this.rooms[roomId]
  }

  public update(room: RoomClass): void {
    this.rooms[room.id] = room
  }
}

export default LocalMemoryRoomRepository
