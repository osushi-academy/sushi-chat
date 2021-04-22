# **注意**
- **[Option]表記は省略可能の意味ではなく、その機能がOptionの機能であると言う意味です。**（わかりづらくてすみません）
- 全てのパラメータ名は`camlCase`（小文字始まり・単語の接続は大文字）です

## モデル
### ChatItemモデル
#### Messageモデル
```ts
type Message = {
  "id": string                  // アイテムID
  "topicId": string             // トピックID
  "type": "message"             // コメントタイプ
  "iconId": string              // アイコンID
  "timestamp": number           // 経過時間のタイムスタンプ（単位: 秒、整数表記）
  "content": string             // メッセージの内容
　"isQuestion": boolean         // 質問コメントかどうか
}
```

#### Reactionモデル
```ts
type Reaction = {
  "id": string                   // アイテムID
  "topicId": string              // トピックID
  "type": "reaction"             // コメントタイプ
  "iconId": string               // アイコンID
  "timestamp": number            // 経過時間のタイムスタンプ（単位: 秒、整数表記）
  "target": {
     "id": string                // リアクションを行なった対象のメッセージID
     "content": string           // リアクションを行なった対象のメッセージの内容
   }
}
```

#### ChatItemモデル
```ts
type ChatItem = Message | Reaction
```

### Topicモデル
```ts
type Topic = {
  "id": string             // トピックID
  "title": string          // トピックのタイトル
}
```

## コメントの送受信
### コメントを投稿する（`POST_CHAT_ITEM`）
#### メッセージの場合
Client to Sever
```ts
{
  "type": "message"              // アイテムタイプ
  "id": string                   // フロントで生成したアイテムID
  "topicId": string              // トピックID
  "content": string              // コメントの中身
  "isQuestion": boolean          // 質問コメントか
}
```

#### リアクションの場合
Client to Sever
```ts
{
  "type": "reaction"             // アイテムタイプ
  "id": string                   // フロントで生成したアイテムID
  "topicId": string              // トピックID
  "reactionToId": string         // リアクションを送るメッセージのID
}
```

### アクションの定義
```ts
// 入力開始アクション [Option]
type InsertEditingAction = {
  type: "insert-editing",
  content: {
    id: string,
    topicId: string
    iconId: string
  }
}

// 入力中断アクション [Option]
type RemoveEditingAction = {
  type: "remove-editing"
  content: {
    id: string
    topicId: string
  }
}

// チャット送信アクション
type ConfirmToSendAction = {
  type: "confirm-to-send",
  content: ChatItem
}
```
### コメントを配信する（`PUB_CHAT_ITEM`）
Server to Client
```ts
InsertEditingAction | RemoveEditingAction | ConfirmToSendAction
```
例
```ts
{
  type: "insert-editing",
  content: {
    id: '001',
    topicId: '001',
    iconId: '001
  }
}
```

## スタンプ
### スタンプを送信する（`POST_STAMP`）
```ts
{
  topicId: string
}
```

### スタンプを配信する（`PUB_STAMP`）
```ts
{
  topicId: string
}
```

## ルーム参加時 [Option]
### ルームの参加を伝える（`ENTER_ROOM`）
Client to Server

[request]
```ts
{
  "iconId": string  // アイコンID
  "roomId": string  // 部屋のID [Option]
}
```

[response]
```ts
{
  "chatItems": Message[]    // 現在までのチャット履歴（stringはtopicIdが入る）
  "topics": Topic[]         // トピック情報
  "activeUserCount": number // 現在入室中のユーザー数
}
```

### 新規ユーザーの入室を配信する（`PUB_ENTER_ROOM`） [Option]
Server to Client
```ts
{
  iconId: number             // 新しいユーザーのアイコンID
  activeUserCount: number    // 現在入室中のユーザー数（新しいユーザーを含む）
}
```

### ユーザーの退室を配信する（`PUB_LEAVE_ROOM`） [Option]
Server to Client
```ts
{
  iconId: number             // 退室したユーザーのアイコンID
  activeUserCount: number    // 現在入室中のユーザー数（ユーザーが退室した後の人数）
}
```

---
以下はOptionの内容

## 入力中の表示 [Option]
### 入力開始を伝える（`START_EDIT`）
Client to Server
```ts
{
  "id": string        // フロントで生成したアイテムID
  "topic_id": string  // トピックID
}
```

### 入力終了を伝える（`END_EDIT`）
Client to Server
```ts
{
  "id": string        // フロントで生成したアイテムID
  "topicId": string  // トピックID
}
```

## ルームを建てる [Option]
### ルームを立てる （`BUILD_ROOM`）
Client to Server

[request]
```ts
{
  "topics": Topics[]
}
```

[response]
```ts
{
  "roomId": Topics[]
}
```
