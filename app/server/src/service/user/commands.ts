import User from "../../domain/user/User"

export type CreateUserCommand = {
  userId: string
  idToken?: string
}

export type AdminEnterCommand = {
  idToken: string // サービスに登録している管理者としての認証をするためのID Token
  userId: string // WebSocket接続してきたユーザーとしてのID
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
  user?: User
}
