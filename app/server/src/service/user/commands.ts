import { Socket } from "socket.io"

export type CreateUserCommand = {
  userId: string
}

export type AdminEnterCommand = {
  adminId: string
  userId: string
  roomId: string
}

export type UserEnterCommand = {
  userId: string
  roomId: string
  iconId: string
}

export type UserLeaveCommand = {
  userId: string
}
