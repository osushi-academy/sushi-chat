import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"
import PGPool from "../PGPool"

class UserRepository implements IUserRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async create(user: User) {
    const pgClient = await this.pgPool.client()

    const userQuery =
      "INSERT INTO users (id, is_admin, room_id, icon_id) VALUES ($1, $2, $3, $4)"
    const topicSpeakerQuery =
      "INSERT INTO topics_speakers (user_id, room_id, topic_id) VALUES ($1, $2, $3)"

    try {
      await Promise.all([
        pgClient.query(userQuery, [
          user.id,
          user.isAdmin,
          user.roomId,
          user.iconId,
        ]),
        pgClient.query(topicSpeakerQuery, [user.id, user.roomId, user.speakAt]),
      ])
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
      "SELECT u.is_admin, u.room_id, u.icon_id, ts.topic_id as speak_at FROM users u LEFT JOIN topics_speakers ts on u.id = ts.user_id WHERE u.id = $1 AND u.has_left = false"
    try {
      const res = await pgClient.query(query, [userId])
      if (res.rowCount < 1) return null

      const row = res.rows[0]
      return new User(
        userId,
        row.is_admin,
        row.room_id,
        row.icon_id,
        row.speak_at,
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
      "SELECT u.id, u.is_admin, u.room_id, u.icon_id, ts.topic_id FROM users u LEFT JOIN topics_speakers ts on u.id = ts.user_id WHERE u.room_id = $1 AND u.has_left = false"
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

  public async leaveRoom(user: User) {
    const pgClient = await this.pgPool.client()

    const query = "UPDATE users SET has_left = true WHERE id = $1"

    try {
      await pgClient.query(query, [user.id])
    } catch (e) {
      UserRepository.logError(e, "leaveRoom()")
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
