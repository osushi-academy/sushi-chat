import Topic from "./domain/room/Topic"

export type Room = {
  id: string
  title: string
  topics: Omit<Topic, "state">[]
}
