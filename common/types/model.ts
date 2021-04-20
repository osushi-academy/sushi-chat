/**
 * ChatItemの共通プロパティ
 */
export type ChatItemBase = {
  "id": string                   // アイテムID
  "topic_id": string             // トピックID
  "type": string                 // コメントタイプ
  "icon_id": string              // アイコンID
  "timestamp": number            // 経過時間のタイムスタンプ
}

/**
 * メッセージモデル
 */
export type Message = ChatItemBase & {
  "content": string              // メッセージの内容
  "is_question": boolean
}

/**
 * リアクションモデル
 */
export type Reaction = ChatItemBase & {
  "target": {
     "id": string                // リアクションを行なった対象のメッセージID
     "content": string           // リアクションを行なった対象のメッセージの内容
   }
}

/**
 * チャットアイテムモデル
 */
export type ChatItem = Message | Reaction

/**
 * トピックモデル
 */
export type Topic = {
  "id": string                   // トピックID
  "title": string                // トピックのタイトル
  "description": string          // トピックの説明
}

