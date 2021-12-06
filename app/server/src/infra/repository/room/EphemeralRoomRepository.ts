import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"
import Admin from "../../../domain/admin/admin"
import EphemeralAdminRepository from "../admin/EphemeralAdminRepository"
import { NotFoundError } from "../../../error"

class EphemeralRoomRepository implements IRoomRepository {
  private rooms: RoomClass[] = []

  constructor(private readonly adminRepository: EphemeralAdminRepository) {}

  public build(room: RoomClass) {
    this.rooms.push(room)

    // room作成者のmanagedRoomIdsを更新
    const adminId = room.adminIds.values().next().value as string
    const admin = this.adminRepository.admins.find((a) => a.id === adminId)
    if (!admin) {
      throw new NotFoundError(`Admin(${adminId}) was not found.`)
    }
    this.adminRepository.admins = this.adminRepository.admins.filter(
      (a) => a.id !== adminId,
    )
    this.adminRepository.admins.push(
      new Admin(admin.id, admin.name, [...admin.managedRoomsIds, room.id]),
    )
  }

  public async find(roomId: string) {
    return Promise.resolve(this.rooms.find((r) => r.id === roomId) ?? null)
  }

  public update(room: RoomClass) {
    this.rooms = this.rooms.filter((r) => r.id !== room.id)
    this.rooms.push(room)
  }
}

export default EphemeralRoomRepository
