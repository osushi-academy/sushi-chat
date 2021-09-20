import { ChangeTopicStateType } from "../../events"
import Topic from "../../domain/room/Topic"

export type BuildRoomCommand = {
  title: string
  topics: Omit<Topic, "id" | "state">[]
  description?: string
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

export type ArchiveRoomCommand = {
  id: string
  adminId: string
}

export type ChangeTopicStateCommand = {
  userId: string
  topicId: string
  type: ChangeTopicStateType
}
