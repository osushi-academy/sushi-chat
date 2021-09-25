import Topic from "./Topic"
import RoomClass from "./Room"

interface IRoomFactory {
  create(
    creatorId: string, // 作成した管理者ユーザーのid。roomのadminsに追加される
    title: string,
    topics: Omit<Topic, "id" | "state">[],
    description?: string,
  ): RoomClass
}

export default IRoomFactory
