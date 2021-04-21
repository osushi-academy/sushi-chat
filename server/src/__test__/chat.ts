import { createServer, Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { ArrayRange } from '../utils/range'
import delay from '../utils/delay'

// TODO: 本来はサーバーサイドの本実装におきかわる部分
const createCustomServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer)
  const roomId = "room-id"
  io.on('connection', (socket) => {
    socket.on("BUILD_ROOM", (_, callback) => {
      socket.join(roomId)
      callback({ id: roomId })
    })
    let userCount = 0
    socket.on("ENTER_ROOM", (_, callback: (...args: any[]) => void) => {
      socket.join(roomId)
      callback({
        chatItems: [],
        editingInfo: [],
        topics: [],
        activeUserCount: userCount++
      })
    })
    socket.on("START_EDIT", (data, callback) => {
      socket.to(roomId).emit("PUB_CHAT_ITEM", {
        actions: [
          {
            type: "insert-editing",
            content: {
              id: data.id,
              topicId: data.topicId,
              iconId: '1'
            }
          }
        ]
      })
    })
    socket.on("END_EDIT", (data, callback) => {
      socket.to(roomId).emit("PUB_CHAT_ITEM", {
        actions: [
          {
            type: "remove-editing",
            content: {
              id: data.id,
              topicId: data.topicId,
            }
          }
        ]
      })
    })
    socket.on("POST_CHAT_ITEM", (data, callback) => {
      socket.to(roomId).emit("PUB_CHAT_ITEM", {
        actions: [
          data.type === "message" ? {
            type: "confirm-to-send",
            content: {
              "id": data.id,
              "topicId": data.topicId,
              "type": "message",
              "iconId": '1',
              "timestamp": 100,
              "content": data.content,
            　"isQuestion": data.isQuestion
            }
          } : {
            type: "insert-chatitem",
            content: {
              "id": data.id,
              "topicId": data.topicId,
              "type": "reaction",
              "iconId": '1',
              "timestamp": 100,
              "target": {
                id: data.reactionToId,
                content: '今日はいい天気ですね'
              }
            }
          }
        ]
      })
    })

    
  })
  return io
}

describe("チャット部分のテスト", () => {
  const CLIENTS_COUNT = 5

  let io: Server
  let clientSockets: ClientSocket[]
  let roomId: string
  const topics = ArrayRange(10).map((i) => ({ id: i, title: `タイトル${i}`, description: `説明${i}` }))

  beforeEach((done) => {
    const httpServer = createServer()
    io = createCustomServer(httpServer)
    httpServer.listen(async () => {
      const port = (httpServer as any).address().port
      clientSockets = ArrayRange(CLIENTS_COUNT).map(() => Client(`http://localhost:${port}`))
      await Promise.all(clientSockets.map(socket =>
            new Promise((resolve) => socket.on("connect", () => resolve('FIN')))))
      // 部屋を建てる
      clientSockets[0].emit("BUILD_ROOM", { topics }, (res: { id: string }) => roomId = res.id)
      // 部屋に入る
      clientSockets.map((socket, i) => {
        if (i !== 4) {
          socket.emit("ENTER_ROOM", { roomId: roomId, iconId: 0 }, () => {})
        }
      })
      done()
    })
  })

  // WebSocketのクローズ
  afterEach(() => {
    io.close()
    clientSockets.forEach(socket => socket.close())
  })

  test('チャットの入力と送信のテスト', async () => {
    // 1. ユーザー1が入力を開始
    // 2. ユーザー1がチャットを送信
    // 3. ユーザー2が入力を開始
    // 4. ユーザー2がチャット（質問）を送信
    // 3. ユーザー3がリアクションを送信

    const topicId = 'topic-001'
    const startEditParams = {
      id: '001',
      topicId: 'topic-001'
    }
    const postChatItem = {
      type: "message",
      id: '001',
      topicId,
      content: '今日はいい天気ですね'
    }
    const startEditParams2 = {
      id: '002',
      topicId: 'topic-001'
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
      clientSockets[0].on("PUB_CHAT_ITEM", (...params) => {
        receiveEvent(...params)
        count++
        if(count === 5) resolve(null)
      })
    })

    // イベントを送信する
    clientSockets[1].emit("START_EDIT", startEditParams)
    await delay(2.5)
    clientSockets[1].emit("POST_CHAT_ITEM", postChatItem)
    await delay(2.5)
    clientSockets[2].emit("START_EDIT", startEditParams2)
    await delay(2.5)
    clientSockets[2].emit("POST_CHAT_ITEM", postChatItem2)
    await delay(2.5)
    clientSockets[3].emit("POST_CHAT_ITEM", postChatItem3)
    await tasks

    // テスト
    expect(receiveEvent).nthCalledWith(1, {actions: [{
      type: "insert-editing",
      content: {
        id: startEditParams.id,
        topicId: startEditParams.topicId,
        iconId: '1'
      }
    }]})

    expect(receiveEvent).nthCalledWith(2, {actions: [{
      type: "confirm-to-send",
      content: {
        id: postChatItem.id,
        topicId: postChatItem.topicId,
        type: postChatItem.type,
        iconId: '1',
        timestamp: expect.any(Number),
        content: postChatItem.content,
      }
    }]})

    expect(receiveEvent).nthCalledWith(3, {actions: [{
      type: "insert-editing",
      content: {
        id: startEditParams2.id,
        topicId: startEditParams2.topicId,
        iconId: '2'
      }
    }]})

    expect(receiveEvent).nthCalledWith(4, {actions: [{
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
    }]})

    expect(receiveEvent).nthCalledWith(5, {actions: [{
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
    }]})
  }, 10000)

  test('チャットの入力中断のテスト', async () => {
    // 1. ユーザー1が入力を開始
    // 2. ユーザー1が入力を中断
    // 3. ユーザー1がチャットを送信（→このアクションは`confirm-to-send`ではなく`insert-chatitem`として配信される）

    const topicId = 'topic-001'
    const startEditParams = {
      id: '001',
      topicId: 'topic-001'
    }
    const endEditParams = {
      id: '001',
      topicId: 'topic-001'
    }
    const postChatItem = {
      type: "message",
      id: '002',
      topicId,
      content: '突然送られるメッセージだよ',
      isQuestion: true,
    }

    const receiveEvent = jest.fn()

    // イベントの受信を設定する
    let count = 0
    const tasks = new Promise((resolve) => {
      clientSockets[0].on("PUB_CHAT_ITEM", (...params) => {
        receiveEvent(...params)
        count++
        if(count === 3) resolve(null)
      })
    })

    // イベントを送信する
    clientSockets[1].emit("START_EDIT", startEditParams)
    await delay(2.5)
    clientSockets[1].emit("END_EDIT", endEditParams)
    await delay(2.5)
    clientSockets[2].emit("POST_CHAT_ITEM", postChatItem)
    await tasks

    // テスト
    expect(receiveEvent).nthCalledWith(1, {actions: [{
      type: "insert-editing",
      content: {
        id: startEditParams.id,
        topicId: startEditParams.topicId,
        iconId: '1'
      }
    }]})

    expect(receiveEvent).nthCalledWith(2, {actions: [{
      type: "remove-editing",
      content: {
        id: endEditParams.id,
        topicId: endEditParams.topicId,
      }
    }]})

    expect(receiveEvent).nthCalledWith(3, {actions: [{
      type: "insert-chatitem",
      content: {
        id: postChatItem.id,
        topicId: postChatItem.topicId,
        type: postChatItem.type,
        iconId: '3',
        timestamp: expect.any(Number),
        content: postChatItem.content
      }
    }]})
  }, 10000)

  test('チャットのバッチ処理のテスト', async () => {
    // 1. ユーザー1が入力を開始
    // 2. ユーザー2が入力を開始
    // 3. ユーザー1がチャットを送信
    // 4. ユーザー2がチャット（質問）を送信
    // 5. ユーザー3がリアクションを送信 （=> 5個のイベントがバッチ処理として1つのイベントになり配信される）

    const topicId = 'topic-001'
    const startEditParams = {
      id: '001',
      topicId: 'topic-001'
    }
    const startEditParams2 = {
      id: '002',
      topicId: 'topic-001'
    }
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
      clientSockets[0].on("PUB_CHAT_ITEM", (...params) => {
        receiveEvent(...params)
        count++
        if(count === 5) resolve(null)
      })
    })

    // イベントを送信する
    clientSockets[1].emit("START_EDIT", startEditParams)
    clientSockets[1].emit("START_EDIT", startEditParams2)
    clientSockets[2].emit("POST_CHAT_ITEM", postChatItem)
    clientSockets[2].emit("POST_CHAT_ITEM", postChatItem2)
    clientSockets[3].emit("POST_CHAT_ITEM", postChatItem3)
    await tasks

    // テスト
    expect(receiveEvent).nthCalledWith(1, {actions: [
      {
        type: "insert-editing",
        content: {
          id: startEditParams.id,
          topicId: startEditParams.topicId,
          iconId: '1'
        }
      },
      {
        type: "insert-editing",
        content: {
          id: startEditParams2.id,
          topicId: startEditParams2.topicId,
          iconId: '2'
        }
      },
      {
        type: "confirm-to-send",
        content: {
          id: postChatItem.id,
          topicId: postChatItem.topicId,
          type: postChatItem.type,
          iconId: '1',
          timestamp: expect.any(Number),
          content: postChatItem.content,
        }
      },
      {
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
      },
      {
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
      }
    ]})
  }, 10000)

  test('途中から参加した参加者に履歴が送信される', async (done) => {
    // 1. ユーザー1が入力を開始
    // 2. ユーザー1がチャットを送信
    // 3. ユーザー2が入力を開始
    // 4. ユーザー3がリアクションを送信（=> ユーザー2は入力中）

    const topicId = 'topic-001'
    const startEditParams = {
      id: '001',
      topicId: 'topic-001'
    }
    const postChatItem = {
      type: "message",
      id: '001',
      topicId,
      content: '今日はいい天気ですね'
    }
    const startEditParams2 = {
      id: '002',
      topicId: 'topic-001'
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
        if(count === 4) resolve(null)
      })
    })

    // イベントを送信する
    clientSockets[1].emit("START_EDIT", startEditParams)
    clientSockets[1].emit("POST_CHAT_ITEM", postChatItem)
    clientSockets[2].emit("START_EDIT", startEditParams2)
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
        }
      ])

      expect(data.topics).toEqual(topics)
      expect(data.editingInfo).toEqual([{ id: startEditParams2.id, topicId: startEditParams2.topicId, iconId: '2' }])
      expect(data.activeUserCount).toEqual(4)
      
      done()
    })
  }, 10000)

  // TODO: 部屋の入室退室のテスト
  // TODO: スタンプのテスト
  // TODO: 次のトピックへ進むテスト
})