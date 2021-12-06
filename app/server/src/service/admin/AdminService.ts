import Admin from "../../domain/admin/admin"
import IAdminRepository from "../../domain/admin/IAdminRepository"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import { getManagedRoomsCommand } from "./commands"
import IAdminAuth from "../../domain/admin/IAdminAuth"
import { ErrorWithCode } from "../../error"

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

  /**
   * 指定されたAdminが管理するルーム一覧を返す
   * @param adminId 管理者のユーザーID
   * @return Promise<RoomClass[]> 管理者が管理しているルームの一覧
   */
  public async fetchManagedRooms({
    adminId,
  }: getManagedRoomsCommand): Promise<RoomClass[]> {
    const admin = await this.adminRepository.find(adminId)
    if (!admin) {
      throw new ErrorWithCode(`Admin(${adminId}) was not found.`, 404)
    }

    const managedRooms = await Promise.all(
      admin.managedRoomsIds.map((roomId) => this.roomRepository.find(roomId)),
    )

    return managedRooms.filter((room): room is RoomClass => room !== null)
  }
}

export default AdminService
