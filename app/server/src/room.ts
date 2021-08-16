import { ChatItem } from "./chatItem"
import Topic from "./domain/room/Topic"

export type Room = {
  id: string
  title: string
  topics: Topic[]
}

export type BuildRoom = {
  topics: Topic[]
}

export type BuildRoomReceive = {
  topics: Topic[]
}

export type EnterRoom = {
  iconId: number // 新しいユーザーのアイコンID
  activeUserCount: number // 現在入室中のユーザー数（新しいユーザーを含む）
}

export type LeaveRoom = {
  iconId: number // 退室したユーザーのアイコンID
  activeUserCount: number // 現在入室中のユーザー数（ユーザーが退室した後の人数）
}

export type EnterRoomResponce = {
  chatItems: ChatItem[] // 現在までのチャット履歴（stringはtopicIdが入る）
  topics: Topic[] // トピック情報
  activeUserCount: number // 現在入室中のユーザー数
}

export type EnterRoomReceive = {
  iconId: string // アイコンID
  roomId: string // 部屋のID [Option]
}
