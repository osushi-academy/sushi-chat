import { Topic } from './contents'
import { UserInputAction } from './userInputActions'

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
 * POST_CHAT_ITEMイベントを送るときのイベントの中身
 */
export type PostChatItemMessageParams = {
  type: 'message' // アイテムタイプ
  id: string // フロントで生成したアイテムID
  iconId: string // アイコンID
  topicId: string // トピックID
  content: string // コメントの中身
  isQuestion: boolean
}
export type PostChatItemReactionParams = {
  type: 'reaction' // アイテムタイプ
  id: string // フロントで生成したアイテムID
  iconId: string // アイコンID
  topicId: string // トピックID
  reactionToId: string // リアクションを送るメッセージのID
}
export type PostChatItemParams =
  | PostChatItemMessageParams
  | PostChatItemReactionParams

/**
 * PUB_CHAT_ITEMイベントを送るときのイベントの中身
 *
 * @example
 * const params: PubChatItemParams = {
 *    actions: {
 *      // トピック001に関するユーザーのアクション
 *      "001": [
 *        {
 *          type: "insert-editing",
 *          content: {
 *            id: "1",
 *          }
 *        },
 *        {
 *          type: "confirm-to-send",
 *          content: {
 *            // ...省略
 *          }
 *        },
 *      // ...
 *      ],
 *      // トピック002に関するユーザーのアクション
 *      "002": [ ... 省略]
 *    }
 *  }
 * }
 */
export type PubChatItemParams = {
  actions: Record<string, UserInputAction[]>
}

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
  iconId: string
}

/**
 * ENTER_ROOMイベントを送ったときのレスポンスの中身
 *
 * @example
 * const response: EnterRoomResponse = {
 *    actions: {
 *      // トピック001に関するユーザーのアクション
 *      "001": [
 *        {
 *          type: "insert-editing",
 *          content: {
 *            id: "1",
 *          }
 *        },
 *        {
 *          type: "confirm-to-send",
 *          content: {
 *            // ...省略
 *          }
 *        },
 *      // ...
 *      ],
 *      // トピック002に関するユーザーのアクション
 *      "002": [ ... 省略]
 *     }
 *   },
 *   topics: [
 *     { id: "001", title: "タイトル", description: "説明" },
 *     { id: "002", title: "タイトル", description: "説明" },
 *     ...
 *   ]
 * }
 */
export type EnterRoomResponse = {
  actions: Record<string, UserInputAction>
  topics: Topic[]
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
