import { TopicState } from "sushi-chat-shared"
import Topic from "../../domain/room/Topic"

export type BuildRoomCommand = {
  title: string
  topics: Omit<Topic, "id" | "state" | "pinnedChatItemId">[]
  description?: string
}
export type FinishRoomCommand = {
  userId: string
}

export type StartRoomCommand = {
  id: string
  adminId: string
}

export type InviteRoomCommand = {
  id: string
  adminInviteKey: string
  adminId: string
}

export type checkAdminAndfindCommand = {
  id: string
  adminId: string
}

export type ArchiveRoomCommand = {
  id: string
  adminId: string
}

export type ChangeTopicStateCommand = {
  userId: string
  topicId: number
  state: TopicState
}
