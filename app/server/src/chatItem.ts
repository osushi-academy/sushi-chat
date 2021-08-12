export type ChatItemBase = {
  id: string
  topicId: string
  type: string
  iconId: string
  timestamp: number
  createdAt: Date
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

export type MessageStore = ChatItemBase & {
  type: "message"
  content: string
  target: string | null
}

export type ReactionStore = ChatItemBase & {
  type: "reaction"
  target: string
}

export type QuestionStore = ChatItemBase & {
  type: "question"
  content: string
}

export type AnswerStore = ChatItemBase & {
  type: "answer"
  content: string
  target: string
}

export type ChatItemStore =
  | MessageStore
  | ReactionStore
  | QuestionStore
  | AnswerStore

export type User = {
  id: string
  iconId: string
}
