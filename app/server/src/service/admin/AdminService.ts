import Admin from "../../domain/admin/admin"
import IAdminRepository from "../../domain/admin/IAdminRepository"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
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
  public async getManagedRooms(adminId: string): Promise<RoomClass[]> {
    const admin = await this.adminRepository.find(adminId)
    if (admin === null) {
      throw new ErrorWithCode(`Admin(${adminId}) was not found`, 404)
    }

    // FIXME: postgresqlのコネクションプールのリミットが10なので、for文でfindRoomを回しすぎるとプールが足りなくなって運
    //        が悪いとデッドロックになるため、取得するルーム数を制限している。1リクエストにつき1コネクションを割り当てた
    //         り、依存関係のあるクエリを並列処理しなければ直りそう。
    const limitedManagedRoomIds = admin.managedRoomsIds.slice(0, 3)

    // roomがnullの場合は除去する
    return (
      await Promise.all(limitedManagedRoomIds.map(this.roomRepository.find))
    ).filter((room): room is RoomClass => room != null)
  }
}

export default AdminService
