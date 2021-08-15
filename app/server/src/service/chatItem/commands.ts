export type PostChatItemCommand = {
  userId: string
  chatItemId: string
  topicId: string
}

export type PostMessageCommand = PostChatItemCommand & {
  content: string
  targetId: string | null
}

export type PostReactionCommand = PostChatItemCommand & {
  targetId: string
}

export type PostQuestionCommand = PostChatItemCommand & {
  content: string
}

export type PostAnswerCommand = PostChatItemCommand & {
  content: string
  targetId: string
}
