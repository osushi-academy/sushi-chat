import { Socket } from "socket.io"

export type CreateUserCommand = {
  userId: string
}

export type AdminEnterCommand = {
  adminId: string
  roomId: string
  adminSocket: Socket
}

export type UserEnterCommand = {
  userId: string
  roomId: string
  iconId: string
  userSocket: Socket
}
