import { ChatItem } from "./model"

export type InsertEditingAction = {
  type: "insert-editing"
  content: {
    id: string
  }
}

export type RemoveEditingAction = {
  type: "remove-editing"
  content: {
    id: string
  }
}

export type ConfirmToSendAction = {
  type: "confirm-to-send"
  content: ChatItem
}

export type InsertChatItemAction = {
  type: "insert-chatitem"
  content: ChatItem
}

export type UserInputAction =
  | InsertEditingAction
  | RemoveEditingAction
  | ConfirmToSendAction
  | InsertChatItemAction
