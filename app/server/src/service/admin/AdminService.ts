import Admin from "../../domain/admin/admin"
import IAdminRepository from "../../domain/admin/IAdminRepository"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import { getManagedRoomsCommand } from "./commands"
import IAdminAuth from "../../domain/admin/IAdminAuth"

class AdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly adminAuth: IAdminAuth,
  ) {}

  /**
   * ID tokenを検証し、検証結果得られたadminのIDを返す
   * @param idToken
   * @return Promise<string> 検証の結果得られたadminのID
   */
  public async verifyToken(idToken: string): Promise<string> {
    const { adminId, name } = await this.adminAuth.verifyIdToken(idToken)
    const admin = new Admin(adminId, name, [])

    await this.adminRepository.createIfNotExist(admin)

    return adminId
  }

  // 管理しているRoomを取得する
  public async getManagedRooms(
    command: getManagedRoomsCommand,
  ): Promise<RoomClass[]> {
    const admin = await this.find(command.adminId)
    const managedRoomsIds = admin.managedRoomsIds

    // roomがnullの場合は無視する
    const managedRooms = (
      await Promise.all<RoomClass | null>(
        managedRoomsIds.map(async (roomId) => {
          const room = await this.findRoom(roomId)
          return room
        }),
      )
    ).filter((room): room is RoomClass => room != null)

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
