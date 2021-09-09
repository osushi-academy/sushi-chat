import { ChatItemModel, ChatItemType, RoomState, StampModel } from "./models"
import { ErrorResponse, SuccessResponse } from "./responseBuilder"
import { EmptyRecord } from "./utils"

// Event Names
export type ServerListenEventName =
  | "ENTER_ROOM"
  | "ADMIN_CHANGE_TOPIC_STATE"
  | "POST_CHAT_ITEM"
  | "POST_STAMP"
  | "POST_PINNED_MESSAGE"
  | "ADMIN_FINISH_ROOM"
export type ServerPubEventName =
  | "PUB_USER_COUNT"
  | "PUB_CHANGE_TOPIC_STATE"
  | "PUB_CHAT_ITEM"
  | "PUB_STAMP"
  | "PUB_PINNED_MESSAGE"

// Event Types
// ENTER_ROOM
export type EnterRoomRequest = {
  roomId: string
  iconId: number
  speakerTopicId: number
}
export type EnterRoomResponse =
  | SuccessResponse<{
      chatItems: ChatItemModel[]
      stamps: StampModel[]
      activeUserCount: number
      pinnedChatItemIds: string[]
    }>
  | ErrorResponse

// PUB_USER_COUNT
export type PubUserCountParam = {
  activeUserCount: number
}

// ADMIN_CHANGE_TOPIC_STATE
export type AdminChangeTopicStateRequest = {
  topicId: number
  state: RoomState
}
export type AdminChangeTopicStateResponse = SuccessResponse | ErrorResponse

// PUB_CHANGE_TOPIC_STATE
export type PubChangeTopicStateParam = {
  topicId: number
  state: RoomState
}

// POST_CHAT_ITEM
export type PostChatItemRequest = {
  id: string
  topicId: number
  type: ChatItemType
  content?: string
  quoteId?: string
}
export type PostChatItemResponse = SuccessResponse | ErrorResponse

// PUB_CHAT_ITEM
export type PubChatItemParam = ChatItemModel

// POST_STAMP
export type PostStampRequest = {
  topicId: number
}
export type PostStampResponse = SuccessResponse | ErrorResponse

// PUB_STAMP
export type PubStampParam = StampModel[]

// POST_PINNED_MESSAGE
export type PostPinnedMessageRequest = {
  topicId: number
  chatItemId: string
}
export type PostPinnedMessageResponse = SuccessResponse | ErrorResponse

// PUB_PINNED_MESSAGE
export type PubPinnedMessageParam = {
  chatItemId: string
}

// ADMIN_FINISH_ROOM
export type AdminFinishRoomRequest = EmptyRecord
export type AdminFinishRoomResponse = SuccessResponse | ErrorResponse

// ここからはSocketのイベントを定義するための型パズル

// ServerListenEventName → ServerListenEventRequestへの変換
export type ServerListenEventRequest<EventName extends ServerListenEventName> =
  EventName extends "ENTER_ROOM"
    ? EnterRoomRequest
    : EventName extends "ADMIN_CHANGE_TOPIC_STATE"
    ? AdminChangeTopicStateRequest
    : EventName extends "POST_CHAT_ITEM"
    ? PostChatItemRequest
    : EventName extends "POST_STAMP"
    ? PostStampRequest
    : EventName extends "POST_PINNED_MESSAGE"
    ? PostPinnedMessageRequest
    : EventName extends "ADMIN_FINISH_ROOM"
    ? AdminFinishRoomRequest
    : never

// ServerListenEventName → ServerListenEventResponseへの変換
export type ServerListenEventResponse<EventName extends ServerListenEventName> =
  EventName extends "ENTER_ROOM"
    ? EnterRoomResponse
    : EventName extends "ADMIN_CHANGE_TOPIC_STATE"
    ? AdminChangeTopicStateResponse
    : EventName extends "POST_CHAT_ITEM"
    ? PostChatItemResponse
    : EventName extends "POST_STAMP"
    ? PostStampResponse
    : EventName extends "POST_PINNED_MESSAGE"
    ? PostPinnedMessageResponse
    : EventName extends "ADMIN_FINISH_ROOM"
    ? AdminFinishRoomResponse
    : never

// ServerPubEventName → ServerPubEventParamへの変換
export type ServerPubEventParam<EventName extends ServerPubEventName> =
  EventName extends "PUB_USER_COUNT"
    ? PubUserCountParam
    : EventName extends "PUB_CHANGE_TOPIC_STATE"
    ? PubChangeTopicStateParam
    : EventName extends "PUB_CHAT_ITEM"
    ? PubChatItemParam
    : EventName extends "PUB_STAMP"
    ? PubStampParam
    : EventName extends "PUB_PINNED_MESSAGE"
    ? PubPinnedMessageParam
    : never

export type ServerListenEventsMap = {
  [EventName in ServerListenEventName]: (
    params: ServerListenEventRequest<EventName>,
    callback: (arg: ServerListenEventResponse<EventName>) => void,
  ) => void
}

export type ServerPubEventsMap = {
  [EventName in ServerPubEventName]: (
    params: ServerPubEventParam<EventName>,
  ) => void
}
