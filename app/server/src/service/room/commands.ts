import { TopicState } from "sushi-chat-shared"
import Topic from "../../domain/room/Topic"

export type BuildRoomCommand = {
  id: string
  title: string
  topics: Omit<Topic, "id" | "state" | "pinnedChatItemId">[]
  description?: string
}
export type FinishRoomCommand = {
  roomId: string
  adminId: string
}

export type ChangeTopicStateCommand = {
  roomId: string
  adminId: string
  topicId: number
  state: TopicState
}
