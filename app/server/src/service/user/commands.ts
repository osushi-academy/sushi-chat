export type CreateUserCommand = {
  userId: string
}

export type AdminEnterCommand = {
  adminId: string
  roomId: string
}

export type UserEnterCommand = {
  roomId: string
  userId: string
  iconId: number
  speakerTopicId?: number
}

export type UserLeaveCommand = {
  userId: string
}
