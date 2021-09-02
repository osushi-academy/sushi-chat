import Topic from "./Topic"
import RoomClass from "./Room"

interface IRoomFactory {
  create(title: string, topics: Omit<Topic, "id" | "state">[]): RoomClass
}

export default IRoomFactory
