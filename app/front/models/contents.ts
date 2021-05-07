// Topic型
export type TopicLinkType = 'github' | 'slide' | 'product'
export type Topic = {
  id: string
  title: string
  description: string
  urls: Record<TopicLinkType, string>
}
export type TopicState = 'not-started' | 'ongoing' | 'paused' | 'finished'

// ChatItem型
export type ChatItemType = 'message' | 'reaction' | 'question' | 'answer'
export type ChatItemBase = {
  id: string
  topicId: string
  type: ChatItemType
  iconId: string
  timestamp: number
  createdAt: Date
}
export type Question = ChatItemBase & {
  content: string // 質問の内容
}
export type Answer = ChatItemBase & {
  content: string // 回答する質問
  target: Question // 回答の内容
}
export type Message = ChatItemBase & {
  type: 'message'
  content: string // メッセージの内容
  target: Message | Answer | null // リプライ先のChatItem（通常投稿の場合はnullを指定）
}
export type Reaction = ChatItemBase & {
  type: 'reaction'
  target: Message // リアクション先のChatItem
}
export type ChatItem = Message | Reaction | Question | Answer

// Propのtopicの型（今回はTopicをそのまま）
export type TopicPropType = Topic

// PropのChatItemの型（今回はChatItemをそのまま）
export type ChatItemPropType = ChatItem

// ルーム型
export type Room = {
  id: string
  roomKey: string
  title: string
  topics: Topic[]
}

export type Stamp = {
  userId: string
  topicId: string
}
