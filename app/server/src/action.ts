import { ChatItem } from "./chatItem"

// 入力開始アクション
export type InsertEditingAction = {
  type: "insert-editing"
  content: {
    id: string
    topicId: string
    iconId: string
  }
}

// 入力中断アクション
export type RemoveEditingAction = {
  type: "remove-editing"
  content: {
    id: string
    topicId: string
  }
}

// チャット送信アクション
export type ConfirmToSendAction = {
  type: "confirm-to-send"
  content: ChatItem
}
