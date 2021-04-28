# モデル定義

## ルーム
```ts
type Room = {
  id: string
  roomKey: string
  title: string
  topics: Topic[]
}
```

## トピック
[追加] urlsを追加
```ts
type Topic = {
  id: string
  title: string
  description: string
  urls: Record<TopicLinkType, string>
}
```

### トピックのリンク
[追加]
```ts
type TopicLinkType = "github" | "slide" | "product"
```

### トピックの状態
[変更] activate or not の2状態から4状態へ変更
```ts
type TopicState =
      "not-started" | "ongoing" | "paused" | "finished"
```

## ChatItem
[変更] ceratedAtを追加
```ts
type ChatItemBase = {
  id: string                   // アイテムID
  topicId: string              // トピックID
  type: string                 // コメントタイプ
  iconId: string               // アイコンID
  timestamp: number            // 経過時間のタイムスタンプ（単位s）
  createdAt: Date              // チャットが送信された時刻（サーバー時刻）
}
```
### ChatItemのタイプ
[変更] question, answerが追加
```ts
type ChatItemType = "message" | "reaction" | "question" | "answer"
```

### メッセージ
[変更] target（リプライ先）を追加
```ts
type Message = ChatItemBase & {
  content: string                  // メッセージの内容
  target: Message | Answer | null  // リプライ先のChatItem（通常投稿の場合はnullを指定）
}
```

### リアクション
[変更] targetの型を変更
```ts
type Reaction = ChatItemBase & {
  target: Message                  // リアクション先のChatItem
}
```

### 質問
[追加] 新しく追加
```ts
type Question = ChatItemBase & {
  content: string                  // 質問の内容
}
```

### 回答
[追加] 新しく追加
```ts
type Answer = ChatItemBase & {
  content: string                  // 回答する質問
  target: Question                 // 回答の内容
}
```

### ChatItem全体
```ts
type ChatItem = Message | Reaction | Question | Answer
```

# API定義
## [Admin]ルームをたてる(`ADMIN_BUILD_ROOM`)
client → server

[request]
```ts
{
  title: string
  topics: {
    title: string
    description: string
    urls: Record<TopicLinkType, string>
  }[]
}
```
[response]
```ts
Room
```

## [User] ユーザーがルームに入る（`ENTER_ROOM`）
client → server
[request]
```ts
{
  roomId: string
  iconId: string
}
```
[response]
```ts
{
  chatItems: ChatItem[]   // チャット情報
  topics: Topic[]         // トピック情報
  activeUserCount: number // 現在入室中のユーザー数
}
```

## [Admin] 管理者がルームに入る（`ADMIN_ENTER_ROOM`）
client → server
[request]
```ts
{
  roomId: string
}
```
[response]
```ts
{
  chatItems: ChatItem[]   // チャット情報
  topics: Topic[]         // トピック情報
  activeUserCount: number // 現在入室中のユーザー数
}
```

## 新規ユーザーの入室を配信する（`PUB_ENTER_ROOM`）
server to client
```ts
{
  iconId: number             // 新しいユーザーのアイコンID
  activeUserCount: number    // 現在入室中のユーザー数（新しいユーザーを含む）
}
```

## ユーザーの退室を配信する（`PUB_LEAVE_ROOM`）
server to client
```ts
{
  iconId: number             // 退室したユーザーのアイコンID
  activeUserCount: number    // 現在入室中のユーザー数（ユーザーが退室した後の人数）
}
```

## [Admin] ルームを開始する（`ADMIN_START_ROOM`）
client → server
```ts
{
  roomId: string
}
```

## ルームの開始を通知する（`PUB_START_ROOM`）
server → client
```ts
<empty>
```

## [Admin] トピックの状態を変更する（`ADMIN_CHANGE_TOPIC_STATE`）
client → server
```ts
{
  roomId: string     // 変更対象のroomId
  type: 'NORMAL'     // 変更の種別（topicの状態変更を行う）
  topicId: string    // 変更対象のtopicId
  state: TopicState  // 変更"後"のトピックの状態
}
  |
{
  roomId: string
  type: 'GO_NEXT'    // 変更の種別（今ongoingなトピックの終了と次のトピックの開始を同時に行う）
}
```

## トピックの状態の変更を通知する（`PUB_CHANGE_TOPIC_STATE`）
server → client
```ts
{
  type: 'NORMAL'    // 変更の種別（topicの状態変更を行う）
  topicId: string   // 変更対象のtopicId
  state: TopicState // 変更"後"のトピックの状態
}
 |
{
  type: 'GO_NEXT'   // 変更の種別（今ongoingなトピックの終了と次のトピックの開始を同時に行う）
}
```

## コメントを投稿する（`POST_CHAT_ITEM`）
client → server

### メッセージ
```ts
{
  id: string             // フロントで生成したアイテムID
  topicId: string        // トピックID
  type: 'message'        // コメントタイプ
  content: string        // コメントの内容
  target: string | null  // リプライする対象のアイテムID（通常投稿である場合はnullを指定する）
}
```

### リアクション
```ts
{
  id: string           // フロントで生成したアイテムID
  topicId: string      // トピックID
  type: 'reaction'     // コメントタイプ
  reactionToId: string // Reactionを行う対象のアイテムID
}
```

### 質問
```ts
{
  id: string       // フロントで生成したアイテムID
  topicId: string  // トピックID
  type: 'question' // コメントタイプ
  content: string  // コメントの内容
}
```

### 回答
```ts
{
  id: string       // フロントで生成したアイテムID
  topicId: string  // トピックID
  type: 'answer'   // コメントタイプ
  content: string  // コメントの内容
  target: string   // 回答するする質問のアイテムID
}
```

## コメントを配信する（`PUB_CHAT_ITEM`）
server to client
```ts
ChatItem
```


## [Admin] ルームを終了する（`ADMIN_FINISH_ROOM`）
client to server
```ts
{
  roomId: string
}
```

## ルームの終了を配信する（`PUB_FINISH_ROOM`）
server to client
```ts
<empty>
```

## [Admin] ルームを閉じる（`ADMIN_CLOSE_ROOM`）
client to server
```ts
{
  roomId: string
}
```

## ルーム閉じを配信する（`PUB_CLOSE_ROOM`）
client to server
```ts
<empty>
```



ログイン機能
パスワード機能
質問から回答にジャンプする機能（リプライをツリー表示する機能）
リアクションにリアクションできる機能
リプライにリプライできる機能
リプライを質問としては投稿できない
質問にリプライはできない
マルチルーム
RESTとWebSocketの使い分け
ウィンドウ閉じる時に警告
バリデーション
途中から開いたユーザーに進行中のトピックへの誘導を行う（矢印を出してスクロールを促すor自動的にスクロールさせる）