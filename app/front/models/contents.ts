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
export type ChatItemBase = {
  id: string
  topicId: string
  type: string
  iconId: string
  timestamp: number
}
export type Message = ChatItemBase & {
  type: 'message'
  content: string
  isQuestion: boolean
}
export type Reaction = ChatItemBase & {
  type: 'reaction'
  target: {
    id: string
    content: string
  }
}
export type ChatItem = Message | Reaction

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
