import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"
import PGPool from "../PGPool"

class UserRepository implements IUserRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async create(user: User) {
    const pgClient = await this.pgPool.client()

    const query = "INSERT INTO users (id, is_admin) VALUES ($1, $2)"
    try {
      await pgClient.query(query, [user.id, user.isAdmin])
    } catch (e) {
      UserRepository.logError(e, "create()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async find(userId: string): Promise<User | null> {
    const pgClient = await this.pgPool.client()

    const query =
      "SELECT u.is_admin, u.room_id, u.icon_id, ts.topic_id FROM users u LEFT JOIN topics_speakers ts on u.id = ts.user_id WHERE id = $1"
    try {
      const res = await pgClient.query(query, [userId])
      if (res.rowCount < 1) return null

      const row = res.rows[0]
      return new User(
        userId,
        row.is_admin,
        row.room_id,
        row.icon_id,
        row.topic_id,
      )
    } catch (e) {
      UserRepository.logError(e, "find()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async selectByRoomId(roomId: string): Promise<User[]> {
    const pgClient = await this.pgPool.client()

    const query =
      "SELECT u.id, u.is_admin, u.room_id, u.icon_id, ts.topic_id FROM users u JOIN topics_speakers ts on u.id = ts.user_id WHERE u.room_id = $1"
    try {
      const res = await pgClient.query(query, [roomId])
      const users = res.rows.map((r) => {
        return new User(r.id, r.is_admin, r.room_id, r.icon_id, r.topic_id)
      })

      return users
    } catch (e) {
      UserRepository.logError(e, "selectByRoomId()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  public async update(user: User) {
    const pgClient = await this.pgPool.client()

    const userQuery =
      "UPDATE users SET room_id = $1, icon_id = $2 WHERE id = $3"
    const topicsSpeakerQuery =
      "INSERT INTO topics_speakers (user_id, room_id, topic_id) VALUES ($1, $2, $3)"

    try {
      await Promise.all([
        pgClient.query(userQuery, [user.roomId, user.iconId, user.id]),
        pgClient.query(topicsSpeakerQuery, [
          user.id,
          user.roomId,
          user.speakAt,
        ]),
      ])
    } catch (e) {
      UserRepository.logError(e, "update()")
      throw e
    } finally {
      pgClient.release()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static logError(error: any, context: string) {
    const datetime = new Date().toISOString()
    console.error(
      `[${datetime}] UserRepository.${context}: ${error ?? "Unknown error."}`,
    )
  }
}

export default UserRepository
