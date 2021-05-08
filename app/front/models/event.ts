import { ChatItem, Topic, TopicState } from './contents'

/**
 * WebSocketのイベント名
 */
export type EventType =
  | 'POST_CHAT_ITEM'
  | 'PUB_CHAT_ITEM'
  | 'START_EDIT'
  | 'END_EDIT'
  | 'ENTER_ROOM'
  | 'BUILD_ROOM'

/**
 * ルームを立てる
 *
 * @user Admin
 * @event ADMIN_BUILD_ROOM
 */
export type AdminBuildRoomResponse = Room

// コメントを投稿する POST_CHAT_ITEM
type PostChatItemParamsBase = {
  id: string
  topicId: string
  type: 'message' | 'reaction' | 'question' | 'answer'
}

export type PostChatItemMessageParams = PostChatItemParamsBase & {
  type: 'message'
  content: string
  target: string | null
}

export type PostChatItemReactionParams = PostChatItemParamsBase & {
  type: 'reaction'
  reactionToId: string
}

export type PostChatItemQuestionParams = PostChatItemParamsBase & {
  type: 'question'
  content: string
}

export type PostChatItemAnswerParams = PostChatItemParamsBase & {
  type: 'answer'
  content: string
  target: string
}

/**
 * コメントを投稿する
 *
 * @user General
 * @event POST_CHAT_ITEM
 */
export type PostChatItemParams =
  | PostChatItemMessageParams
  | PostChatItemReactionParams
  | PostChatItemQuestionParams
  | PostChatItemAnswerParams

/**
 * START_EDITイベントを送るときのイベントの中身
 */
export type StartEditParams = {
  id: string // フロントで生成したアイテムID
  topicId: string // トピックID
}

/**
 * END_EDITイベントを送るときのイベントの中身
 */
export type EndEditParams = {
  id: string
  topicId: string
}

/**
 * ENTER_ROOMイベントを送るときのイベントの中身
 */
export type EnterRoomParams = {
  roomId: string
  iconId: string
}

/**
 * ENTER_ROOMイベントを送ったときのレスポンスの中身
 */
export type EnterRoomResponse = {
  chatItems: ChatItem[]
  topics: (Topic & { state: TopicState })[]
  activeUserCount: number
}

/**
 * BUILD_ROOMイベントを送ったときのレスポンスの中身
 */
export type BuildRoomParams = {
  id: string
  topics: Topic[]
}

/**
 * イベント名を引数にとって、イベントを送るときの型を返す
 *
 * @example
 * const params: EventParams<"START_EDIT"> = {
 *   id: "1234", topoc_id: "2"
 * }
 */
export type EventParams<
  EventName extends EventType
> = EventName extends 'POST_CHAT_ITEM'
  ? PostChatItemParams
  : EventName extends 'PUB_CHAT_ITEM'
  ? PubChatItemParams
  : EventName extends 'START_EDIT'
  ? StartEditParams
  : EventName extends 'END_EDIT'
  ? EndEditParams
  : EventName extends 'ENTER_ROOM'
  ? EnterRoomParams
  : EventName extends 'BUILD_ROOM'
  ? BuildRoomParams
  : never

/**
 * イベント名を引数にとって、イベントを送ったときのレスポンスの型を返す
 *
 * @example
 * const params: EventResponse<"ENTER_ROOM"> = {
 *   actions: { ... }, topocs: [ ... ]
 * }
 */
export type EventResponse<
  EventName extends EventType
> = EventName extends 'ENTER_ROOM' ? EnterRoomResponse : void
