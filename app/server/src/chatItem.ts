export type ChatItemBase = {
  id: string
  topicId: string
  type: ChatItemType
  iconId: string
  createdAt: Date
  timestamp?: number
}

export type ChatItemType = "message" | "reaction" | "question" | "answer"

export type Message = ChatItemBase & {
  type: "message"
  content: string
  target: Message | Answer | null
}

export type Reaction = ChatItemBase & {
  type: "reaction"
  target: Message | Question | Answer
}

export type Question = ChatItemBase & {
  type: "question"
  content: string
}

export type Answer = ChatItemBase & {
  type: "answer"
  content: string
  target: Question
}

export type ChatItem = Message | Reaction | Question | Answer
