import Admin from "../../domain/admin/admin"
import IAdminRepository from "../../domain/admin/IAdminRepository"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import { getManagedRoomsCommand } from "./commands"

class AdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly roomRepository: IRoomRepository,
  ) {}

  // 管理しているRoomを取得する
  public async getManagedRooms(
    command: getManagedRoomsCommand,
  ): Promise<RoomClass[]> {
    const admin = await this.find(command.adminId)
    const managedRoomsIds = admin.managedRoomsIds

    if (!managedRoomsIds) {
      throw new Error(
        `[sushi-chat-server] temporary managedRoomsIds undefined error.`,
      )
    }

    const managedRooms: RoomClass[] = []
    managedRoomsIds.forEach(async (roomId) => {
      const room = await this.findRoom(roomId)
      if (!room) {
        // TODO: roomがないならadminのmanagedRoomsIdsからroomIdを消す
        // そしてadminをアップデート
      } else {
        managedRooms.push(room)
      }
    })

    return managedRooms
  }

  private async find(adminId: string): Promise<Admin> {
    const admin = await this.adminRepository.find(adminId)
    if (!admin) {
      throw new Error(`[sushi-chat-server] Admin does not exists.`)
    }
    return admin
  }

  private async findRoom(roomId: string): Promise<RoomClass | null> {
    const room = await this.roomRepository.find(roomId)
    return room
  }
}

export default AdminService
