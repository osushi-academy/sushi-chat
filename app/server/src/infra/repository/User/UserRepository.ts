import IUserRepository from "../../../domain/user/IUserRepository"
import User from "../../../domain/user/User"
import PGPool from "../PGPool"
import { Pool, PoolClient } from "pg"

class UserRepository implements IUserRepository {
  constructor(private readonly pgPool: PGPool) {}

  public async create(user: User) {
    const pgClient = await this.pgPool.client()

    const queries = []

    const userQuery =
      "INSERT INTO users (id, is_admin, is_system, room_id, icon_id) VALUES ($1, $2, $3, $4, $5)"
    queries.push(() =>
      pgClient.query(userQuery, [
        user.id,
        user.isAdmin,
        user.isSystem,
        user.roomId,
        user.iconId,
      ]),
    )

    if (user.speakAt) {
      const topicSpeakerQuery =
        "INSERT INTO topics_speakers (user_id, room_id, topic_id) VALUES ($1, $2, $3)"
      queries.push(() =>
        pgClient.query(topicSpeakerQuery, [user.id, user.roomId, user.speakAt]),
      )
    }

    try {
      await Promise.all(queries.map((q) => q()))
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
      "SELECT u.is_admin, u.is_system, u.room_id, u.icon_id, ts.topic_id as speak_at FROM users u LEFT JOIN topics_speakers ts on u.id = ts.user_id WHERE u.id = $1 AND u.has_left = false"
    try {
      const res = await pgClient.query(query, [userId])
      if (res.rowCount < 1) return null

      const row = res.rows[0]
      return new User(
        userId,
        row.is_admin,
        row.is_system,
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

  public async selectByRoomId(
    roomId: string,
    pgClient: PoolClient,
  ): Promise<User[]> {
    const query =
      "SELECT u.id, u.is_admin, u.is_system, u.room_id, u.icon_id, ts.topic_id FROM users u LEFT JOIN topics_speakers ts on u.id = ts.user_id WHERE u.room_id = $1 AND u.has_left = false"
    try {
      const res = await pgClient.query(query, [roomId])
      const users = res.rows.map((r) => {
        return new User(
          r.id,
          r.is_admin,
          r.is_system,
          r.room_id,
          r.icon_id,
          r.topic_id,
        )
      })

      return users
    } catch (e) {
      UserRepository.logError(e, "selectByRoomId()")
      throw e
    }
  }

  public async selectByRoomIds(
    roomIds: string[],
    pgClient: PoolClient,
  ): Promise<Record<string, User[]>> {
    const query = `SELECT u.id, u.is_admin, u.is_system, u.room_id, u.icon_id, ts.topic_id FROM users u
        LEFT JOIN topics_speakers ts on u.id = ts.user_id
        WHERE u.room_id = ANY($1::UUID[]) AND u.has_left = false`

    const res = await pgClient.query(query, [roomIds])
    return res.rows.reduce<Record<string, User[]>>((acc, cur) => {
      const user = new User(
        cur.id,
        cur.is_admin,
        cur.is_system,
        cur.room_id,
        cur.icon_id,
        cur.topic_id,
      )

      if (cur.room_id in acc) {
        acc[cur.room_id].push(user)
      } else {
        acc[cur.room_id] = [user]
      }

      return acc
    }, {})
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
