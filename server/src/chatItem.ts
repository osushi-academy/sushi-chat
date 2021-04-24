export type ChatItem = Message | Reaction;

export type Message = {
  id: string; // アイテムID
  topicId: string; // トピックID
  type: "message"; // コメントタイプ
  iconId: string; // アイコンID
  timestamp: number; // 経過時間のタイムスタンプ（単位: 秒、整数表記）
  content: string; // メッセージの内容
  isQuestion: boolean; // 質問コメントかどうか
};

export type Reaction = {
  id: string; // アイテムID
  topicId: string; // トピックID
  type: "reaction"; // コメントタイプ
  iconId: string; // アイコンID
  timestamp: number; // 経過時間のタイムスタンプ（単位: 秒、整数表記）
  target: {
    id: string; // リアクションを行なった対象のメッセージID
    content: string; // リアクションを行なった対象のメッセージの内容
  };
};

export type ChatItemReceive = MessageReceive | ReactionReceive;

export type MessageReceive = {
  type: "message"; // アイテムタイプ
  id: string; // フロントで生成したアイテムID
  topicId: string; // トピックID
  content: string; // コメントの中身
  isQuestion: boolean; // 質問コメントか
};

export type ReactionReceive = {
  type: "reaction"; // アイテムタイプ
  id: string; // フロントで生成したアイテムID
  topicId: string; // トピックID
  reactionToId: string; // リアクションを送るメッセージのID
};
