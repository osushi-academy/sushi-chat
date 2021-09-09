export type ChatItemType = "message" | "reaction" | "question" | "answe"
export type ChatItemSenderType = "general" | "admin" | "speaker" | "system"
export type RoomState = "OPEN" | "PAUSE" | "CLOSE"

export type ChatItemModel = {
  id: string
  topicId: number
  createdAt: string
  type: ChatItemType
  senderType: ChatItemSenderType
  iconId: number
  content?: string
  quote?: string
  timestamp?: number
}

export type StampModel = {
  id: string
  topicId: number
  timestamp: number
  createdAt: string
}
