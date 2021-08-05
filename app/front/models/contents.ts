// Topic型
export type TopicLinkType = "github" | "slide" | "product"
export type Topic = {
  id: string
  title: string
  urls: Partial<Record<TopicLinkType, string>>
}
export type TopicState = "not-started" | "active" | "paused" | "finished"

// ChatItem型
export type ChatItemType = "message" | "reaction" | "question" | "answer"
export type ChatItemBase = {
  id: string
  topicId: string
  type: string
  iconId: string
  timestamp: number
  createdAt: Date
}
export type Question = ChatItemBase & {
  type: "question"
  content: string // 質問の内容
}
export type Answer = ChatItemBase & {
  type: "answer"
  content: string // 回答する質問
  target: Question // 回答の内容
}
export type Message = ChatItemBase & {
  type: "message"
  content: string // メッセージの内容
  target: Message | Answer | null // リプライ先のChatItem（通常投稿の場合はnullを指定）
}
export type Reaction = ChatItemBase & {
  type: "reaction"
  target: Message | Question | Answer // リアクション先のChatItem
}
export type ChatItem = Message | Reaction | Question | Answer

// PropのChatItemの型（今回はChatItemをそのまま）
export type ChatItemPropType = ChatItem

// Propのtopicの型（今回はTopicをそのまま）
export type TopicPropType = Topic

export type TopicStatesPropType = { [key: string]: TopicState }

export type IconsPropType = { url: string }[]

// ルーム型
export type Room = {
  id: string
  title: string
  topics: Topic[]
}

export type Stamp = {
  userId: string
  topicId: string
}

export type DeviceType = "windows" | "mac" | "smartphone"
