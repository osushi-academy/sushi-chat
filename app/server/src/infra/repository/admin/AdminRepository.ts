import IAdminRepository from "../../../domain/admin/IAdminRepository"
import Admin from "../../../domain/admin/admin"
import PGPool from "../PGPool"

class AdminRepository implements IAdminRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async find(adminId: string): Promise<Admin | null> {
    const pgClient = await this.pgPool.client()

    const adminQuery = "SELECT name FROM admins WHERE id = $1"
    const roomsQuery = "SELECT room_id FROM rooms_admins WHERE admin_id = $1"

    try {
      const [adminRes, roomsRes] = await Promise.all([
        pgClient.query(adminQuery, [adminId]),
        pgClient.query(roomsQuery, [adminId]),
      ])
      if (adminRes.rowCount < 1) return null

      const admin = adminRes.rows[0]
      const roomIds = roomsRes.rows.map((r) => r.room_id)

      return new Admin(adminId, admin.name, roomIds)
    } catch (e) {
      AdminRepository.logError(e, "find()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static logError(error: any, context: string) {
    const datetime = new Date().toISOString()
    console.error(
      `[${datetime}] AdminRepository.${context}: ${error ?? "Unknown error."}`,
    )
  }
}

export default AdminRepository
