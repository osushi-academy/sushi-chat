import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"

class EphemeralRoomRepository implements IRoomRepository {
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

export default EphemeralRoomRepository
