import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"

class EphemeralRoomRepository implements IRoomRepository {
  private readonly rooms: Record<string, RoomClass> = {}

  public build(room: RoomClass) {
    this.rooms[room.id] = room
  }

  public async find(roomId: string) {
    if (roomId in this.rooms) {
      return this.rooms[roomId]
    } else {
      return null
    }
  }

  public update(room: RoomClass) {
    this.rooms[room.id] = room
  }
}

export default EphemeralRoomRepository
