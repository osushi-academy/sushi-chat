import { Topic } from './model'
import { UserInputAction } from './userInputActions'

export type EventType = "POST_CHAT_ITEM" | "PUB_CHAT_ITEM" | "START_EDIT" | "END_EDIT" | "ENTER_ROOM" | "BUILD_ROOM"

export type PostChatItemParams = {
  type: "message"              // アイテムタイプ
  id: string                   // フロントで生成したアイテムID
  topic_id: string             // トピックID
  content: string              // コメントの中身
} | {
  type: "reaction"             // アイテムタイプ
  id: string                   // フロントで生成したアイテムID
  topic_id: string             // トピックID
  reaction_to_id: string       // リアクションを送るメッセージのID
}

export type PubChatItemParams = {
  actions: Record<string, UserInputAction[]>
}

export type StartEditParams = {
  "id": string        // フロントで生成したアイテムID
  "topic_id": string  // トピックID
}

export type EndEditParams = {
  id: string
  topic_id: string
}

export type EnterRoomParams = {
  icon_id: string
}

export type EnterRoomResponse = {
  actions: Record<string, UserInputAction>,
  topics: Topic[]
}

export type BuildRoomParams = {
  id: string
  topics: Topic[]
}

export type EventParams<EventName extends EventType> =
    EventName extends "POST_CHAT_ITEM" ? PostChatItemParams :
    EventName extends "PUB_CHAT_ITEM" ? PubChatItemParams :
    EventName extends "START_EDIT" ? StartEditParams :
    EventName extends "END_EDIT" ? EndEditParams :
    EventName extends "ENTER_ROOM" ? EnterRoomParams :
    EventName extends "BUILD_ROOM" ? BuildRoomParams : never;

export type EventResponse<EventName extends EventType> =
    EventName extends "ENTER_ROOM" ? EnterRoomResponse : void;
