import { Topic } from "../../topic"

export type BuildRoomCommand = {
  id: string
  title: string
  topics: Omit<Topic, "id">[]
}

export type ChangeTopicStateCommand = {
  userId: string
  topicId: string
  type: "CLOSE_AND_OPEN" | "PAUSE" | "OPEN" | "CLOSE"
}
