import { createServer, Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { ArrayRange } from '../utils/range'
import delay from '../utils/delay'
import createSocketIOServer from '../ioServer'

// サーバーサイドの実装
// ここはテストファイルなので`createCustomServer`関数はあとで別のファイルに切り出す予定
// コメントアウト部分はOptionに移行した機能。とりあえずコメントアウトしている。

// const createCustomServer = (httpServer: HttpServer) => {
//   const io = new Server(httpServer)
//   const roomId = "room-id"
//   const topics = ArrayRange(10).map(id => ({
//     id: `00${id}`,
//     title: `タイトル-${id}`
//   }))

//   io.on('connection', (socket) => {
//     let userCount = 0
    
//     // ユーザーがENTER_ROOMを送ったとき
//     socket.on("ENTER_ROOM", (_, callback) => {
//       socket.join(roomId)
//       callback({
//         chatItems: [],
//         topics,
//         activeUserCount: userCount++
//       })
//     })

//     // ユーザーがPOST_CHAT_ITEMイベントを送信したとき
//     socket.on("POST_CHAT_ITEM", (data, callback) => {
//       socket.to(roomId).emit("PUB_CHAT_ITEM", {
//         actions: [
//           data.type === "message" ? {
//             type: "confirm-to-send",
//             content: {
//               "id": data.id,
//               "topicId": data.topicId,
//               "type": "message",
//               "iconId": '1',
//               "timestamp": 100,
//               "content": data.content,
//             　"isQuestion": data.isQuestion
//             }
//           } : {
//             type: "insert-chatitem",
//             content: {
//               "id": data.id,
//               "topicId": data.topicId,
//               "type": "reaction",
//               "iconId": '1',
//               "timestamp": 100,
//               "target": {
//                 id: data.reactionToId,
//                 content: '今日はいい天気ですね'
//               }
//             }
//           }
//         ]
//       })
//     })

    
//   })
//   return io
// }

describe("チャット部分のテスト", () => {
  const CLIENTS_COUNT = 5

  let io: Server
  let clientSockets: ClientSocket[]
  const topics = ArrayRange(10).map((i) => ({ id: i, title: `タイトル${i}`, description: `説明${i}` }))
  const roomId = "room-id"

  // テストのセットアップ
  beforeEach((done) => {
    const httpServer = createServer()
    io = createSocketIOServer(httpServer)
    httpServer.listen(async () => {
      const port = (httpServer as any).address().port
      clientSockets = ArrayRange(CLIENTS_COUNT).map(() => Client(`http://localhost:${port}`))
      await Promise.all(clientSockets.map(socket =>
            new Promise((resolve) => socket.on("connect", () => resolve('FIN')))))
      // 部屋に入る
      clientSockets.map((socket, i) => {
        if (i !== 4) {
          socket.emit("ENTER_ROOM", { roomId, iconId: 0 }, () => {})
        }
      })
      done()
    })
  })

  // テストの終了処理
  afterEach(() => {
    io.close()
    clientSockets.forEach(socket => socket.close())
  })

  test('チャットの入力と送信のテスト', async () => {
    // テストのストーリー（[Option]はオプション機能になった部分。コメントアウトしている）
    // 1. ユーザー1が入力を開始 [Option]
    // 2. ユーザー1がチャットを送信
    // 3. ユーザー2が入力を開始 [Option]
    // 4. ユーザー2がチャット（質問）を送信
    // 3. ユーザー3がリアクションを送信

    const topicId = 'topic-001'
    const postChatItem = {
      type: "message",
      id: '001',
      topicId,
      content: '今日はいい天気ですね'
    }
    const postChatItem2 = {
      type: "message",
      id: '002',
      topicId,
      content: '本日は雨ではないでしょうか？',
      isQuestion: true,
    }
    const postChatItem3 = {
      type: "reaction",
      id: '003',
      topicId,
      reactionToId: postChatItem.id,
    }

    const receiveEvent = jest.fn()

    // イベントの受信を設定する
    let count = 0
    const tasks = new Promise((resolve) => {
        console.log("#1")
      clientSockets[0].on("PUB_CHAT_ITEM", (...params) => {
        console.log("#2")
        receiveEvent(...params)
        count++
        if(count === 3) resolve(null)
      })
    })

    // イベントを送信する
    clientSockets[1].emit("POST_CHAT_ITEM", postChatItem)
    await delay(2.5)
    clientSockets[2].emit("POST_CHAT_ITEM", postChatItem2)
    await delay(2.5)
    clientSockets[3].emit("POST_CHAT_ITEM", postChatItem3)
    await tasks

    // テスト
    expect(receiveEvent).nthCalledWith(1, {
      type: "confirm-to-send",
      content: {
        id: postChatItem.id,
        topicId: postChatItem.topicId,
        type: postChatItem.type,
        iconId: '1',
        timestamp: expect.any(Number),
        content: postChatItem.content,
      }
    })

    expect(receiveEvent).nthCalledWith(2, {
      type: "confirm-to-send",
      content: {
        id: postChatItem2.id,
        topicId: postChatItem2.topicId,
        type: postChatItem2.type,
        iconId: '2',
        timestamp: expect.any(Number),
        content: postChatItem2.content,
      　isQuestion: postChatItem2.isQuestion
      }
    })

    expect(receiveEvent).nthCalledWith(3, {
      type: "insert-chatitem",
      content: {
        id: postChatItem3.id,
        topicId: postChatItem3.topicId,
        type: postChatItem3.type,
        iconId: '3',
        timestamp: expect.any(Number),
        target: {
          id: postChatItem.id,
          content: postChatItem.content,
        }
      }
    })
  }, 10000)


  test('途中から参加した参加者に履歴が送信される', async (done) => {
    // テストのストーリー
    // 1. ユーザー1がチャットを送信
    // 2. ユーザー3がリアクションを送信（=> ユーザー2は入力中）
    // 3. ユーザー4が参加

    const topicId = 'topic-001'

    const postChatItem = {
      type: "message",
      id: '001',
      topicId,
      content: '今日はいい天気ですね'
    }

    const postChatItem2 = {
      type: "reaction",
      id: '003',
      topicId,
      reactionToId: postChatItem.id,
    }

    const receiveEvent = jest.fn()

    // イベントの受信を設定する
    let count = 0
    const tasks = new Promise((resolve) => {
      clientSockets[0].on("PUB_CHAT_ITEM", (...params) => {
        receiveEvent(...params)
        count++
        if(count === 2) resolve(null)
      })
    })

    // イベントを送信する
    clientSockets[1].emit("POST_CHAT_ITEM", postChatItem)
    clientSockets[3].emit("POST_CHAT_ITEM", postChatItem2)
    await tasks

    clientSockets[4].emit("ENTER_ROOM", { roomId, iconId: '4' }, (data: any) => {
      // テスト
      expect(data.chatItems).toEqual([
        {
          id: postChatItem.id,
          topicId: postChatItem.topicId,
          type: postChatItem.type,
          iconId: '1',
          timestamp: expect.any(Number),
          content:postChatItem.content,
        　isQuestion: false
        },
        {
          id: postChatItem2.id,
          topicId: postChatItem2.topicId,
          type: postChatItem2.type,
          iconId: '2',
          timestamp: expect.any(Number),
          target: {
            id: postChatItem.id,
            content: postChatItem.content
          }
        }
      ])

      expect(data.topics).toEqual(topics)
      
      done()
    })
  }, 10000)

  // TODO: 部屋の入室退室のテスト
  // TODO: スタンプのテスト
  // TODO: 次のトピックへ進むテスト
})