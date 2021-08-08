import IRoomRepository from "../../../domain/room/IRoomRepository"
import RoomClass from "../../../domain/room/Room"
import PGClientFactory from "../../factory/PGClientFactory"
import { ArrayRange } from "../../../utils/range"

// TODO: DBからRoomを取得する処理ができていないので、保存時にはLocalMemoryとDB両方に書き込み、取得はLocalMemoryから読み込む
//  ようになっている。全てDBで行うようにしたい
class RoomRepository implements IRoomRepository {
  private static instance: RoomRepository
  public static getInstance(): RoomRepository {
    if (!this.instance) {
      this.instance = new RoomRepository()
    }
    return this.instance
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private readonly pgClient = PGClientFactory.create()
  private readonly rooms: Record<string, RoomClass> = {}

  public async build(room: RoomClass): Promise<void> {
    this.rooms[room.id] = room

    try {
      const insertRoomQuery =
        "INSERT INTO Rooms (id, roomKey, title, status) VALUES ($1, '', $2, 0)"
      await this.pgClient.query(insertRoomQuery, [room.id, room.title])
    } catch (e) {
      console.error(
        `${
          e.message ?? "Unknown error."
        } (SAVE ROOM/TOPIC IN DB) ${new Date().toISOString()}`,
      )

      throw e
    }

    try {
      const values = room.topics.map((t) => [
        t.id,
        room.id,
        t.title,
        t.description ?? "",
        0,
        t.urls.github,
        t.urls.slide,
        t.urls.product,
      ])
      const insertTopicsQuery = `INSERT INTO Topics (id, roomId, title, description, state, githuburl, slideurl, producturl) VALUES ${ArrayRange(
        values.length,
      )
        .map(
          (i) =>
            `(${ArrayRange(8)
              .map((j) => `$${i * 8 + j + 1}`)
              .join(", ")})`,
        )
        .join(", ")}`
      await this.pgClient.query(insertTopicsQuery, values.flat())
    } catch (e) {
      console.error(
        `${
          e.message ?? "Unknown error."
        } (SAVE ROOM/TOPIC IN DB) ${new Date().toISOString()}`,
      )

      throw e
    }
  }

  public find(roomId: string): RoomClass {
    return this.rooms[roomId]
  }

  public update(room: RoomClass): void {
    this.rooms[room.id] = room
  }
}

export default RoomRepository
