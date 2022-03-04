import IAdminRepository from "../../../domain/admin/IAdminRepository"
import Admin from "../../../domain/admin/admin"
import PGPool from "../PGPool"
import { PoolClient } from "pg"

class AdminRepository implements IAdminRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async createIfNotExist(admin: Admin) {
    const pgClient = await this.pgPool.client()

    const query =
      "INSERT INTO admins (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING"

    try {
      await pgClient.query(query, [admin.id, admin.name])
    } catch (e) {
      AdminRepository.logError(e, "createIfNotExist()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async find(adminId: string): Promise<Admin | null> {
    const pgClient = await this.pgPool.client()

    const adminQuery = "SELECT name FROM admins WHERE id = $1"
    const roomsQuery =
      "SELECT room_id FROM rooms_admins WHERE admin_id = $1 ORDER BY created_at DESC"

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

  public async selectIdsByRoomId(
    roomId: string,
    pgClient: PoolClient,
  ): Promise<string[]> {
    const query = "SELECT admin_id FROM rooms_admins WHERE room_id = $1"

    try {
      const res = await pgClient.query(query, [roomId])
      return res.rows.map((r) => r.admin_id)
    } catch (e) {
      AdminRepository.logError(e, "find()")
      throw e
    }
  }

  public async selectIdsByRoomIds(
    roomIds: string[],
    pgClient: PoolClient,
  ): Promise<Record<string, string[]>> {
    const query =
      "SELECT room_id, admin_id FROM rooms_admins WHERE room_id = ANY($1::UUID[])"

    const res = await pgClient.query(query, [roomIds])
    return res.rows.reduce<Record<string, string[]>>((acc, cur) => {
      if (cur.room_id in acc) {
        acc[cur.room_id].push(cur.admin_id)
      } else {
        acc[cur.room_id] = [cur.acmin_id]
      }

      return acc
    }, {})
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
