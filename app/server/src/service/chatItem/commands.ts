export type PostChatItemCommand = {
  userId: string
  chatItemId: string
  topicId: number
}

export type PostMessageCommand = PostChatItemCommand & {
  content: string
  quoteId: string | null
}

export type PostReactionCommand = PostChatItemCommand & {
  quoteId: string
}

export type PostQuestionCommand = PostChatItemCommand & {
  content: string
  quoteId: string | null
}

export type PostAnswerCommand = PostChatItemCommand & {
  content: string
  quoteId: string
}

export type PinChatItemCommand = {
  chatItemId: string
}
