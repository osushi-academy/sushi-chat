import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"
import Admin from "../../../domain/admin/admin"
import EphemeralAdminRepository from "../admin/EphemeralAdminRepository"

class EphemeralRoomRepository implements IRoomRepository {
  private readonly rooms: Record<string, RoomClass> = {}

  constructor(private readonly adminRepository: EphemeralAdminRepository) {}

  public build(room: RoomClass) {
    this.rooms[room.id] = room

    // room作成者のmanagedRoomIdsを更新
    const adminId = room.adminIds.values().next().value as string
    const admin = this.adminRepository.admins.find((a) => a.id === adminId)
    if (!admin) {
      throw new Error(`Admin(${adminId}) was not found.`)
    }
    this.adminRepository.admins = this.adminRepository.admins.filter(
      (a) => a.id !== adminId,
    )
    this.adminRepository.admins.push(
      new Admin(admin.id, admin.name, [...admin.managedRoomsIds, room.id]),
    )
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
