type ChatItem = Message | Reaction;

type Message = {
  id: string; // アイテムID
  type: "message"; // コメントタイプ
  icon_id: string; // アイコンID
  timestamp: number; // 経過時間のタイムスタンプ
  content: string; // メッセージの内容
};

type Reaction = {
  id: string; // アイテムID
  type: "reaction"; // コメントタイプ
  icon_id: string; // アイコンID
  timestamp: number; // 経過時間のタイムスタンプ
  target: {
    id: string; // リアクションを行なった対象のメッセージID
    content: string; // リアクションを行なった対象のメッセージの内容
  };
};
