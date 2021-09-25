export type ChatItemType = "message" | "reaction" | "question" | "answer"
export type ChatItemSenderType = "general" | "admin" | "speaker" | "system"
export type RoomState = "not-started" | "ongoing" | "finished" | "archived"
export type TopicState = "not-started" | "ongoing" | "paused" | "finished"

export type ChatItemModel = {
  id: string
  topicId: number
  createdAt: string
  type: ChatItemType
  senderType: ChatItemSenderType
  iconId: number
  content?: string
  quote?: ChatItemModel
  timestamp?: number
}

export type StampModel = {
  id: string
  topicId: number
  timestamp: number
  createdAt: string
}

export type Topic = {
  id: number
  order: number
  title: string
}

export type RoomModel = {
  id: string
  title: string
  topics: Topic[]
  state: RoomState
  description?: string
  startDate?: string
  adminInviteKey?: string
}
