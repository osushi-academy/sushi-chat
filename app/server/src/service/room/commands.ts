import { ChangeTopicStateType } from "../../events"
import Topic from "../../domain/room/Topic"

export type BuildRoomCommand = {
  id: string
  title: string
  topics: Omit<Topic, "id" | "state">[]
  description?: string
}

export type ChangeTopicStateCommand = {
  userId: string
  topicId: string
  type: ChangeTopicStateType
}
