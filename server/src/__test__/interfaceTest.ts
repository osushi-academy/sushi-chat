import { createServer, Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { ArrayRange } from '../utils/range'

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
    socket.on("ENTER_ROOM", (_, callback) => {
      socket.join(roomId)
      callback({
        comments: [],
        editing_users: [],
        topics: [],
        active_user_count: userCount++
      })
    })
    socket.on("START_EDIT", (data, callback) => {
      socket.to(roomId).emit("PUB_CHAT_ITEM", {
        actions: [
          {
            type: "insert-editing",
            content: {
              id: data.id,
              topic_id: data.topic_id,
              icon_id: '0'
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
              "id": data.id
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
              "topic_id": data.topic_id,
              "type": "message",
              "icon_id": '1',
              "timestamp": 100,
              "content": data.content,
            　"is_question": false
            }
          } : {
            type: "confirm-to-send",
            content: {
              "id": data.id,
              "topic_id": data.topic_id,
              "type": "reaction",
              "icon_id": '1',
              "timestamp": 100,
              "target": {
                id: data.reaction_to_id,
                content: '内容'
              }
            }
          }
        ]
      })
    })

    
  })
  return io
}

describe('WebSocketのインターフェースのテスト（入出力の形が合っているか）', () => {
  const CLIENTS_COUNT = 5

  let io: Server
  let clientSockets: ClientSocket[]

  // WebSocketのセットアップ
  beforeAll((done) => {
    const httpServer = createServer()
    io = createCustomServer(httpServer)
    httpServer.listen(async () => {
      const port = (httpServer as any).address().port
      clientSockets = ArrayRange(CLIENTS_COUNT).map(() => Client(`http://localhost:${port}`))
      await Promise.all(clientSockets.map(socket =>
            new Promise((resolve) => socket.on("connect", () => resolve('FIN')))))
      done()
    })
  })

  // WebSocketのクローズ
  afterAll(() => {
    io.close()
    clientSockets.forEach(socket => socket.close())
  })

  describe("ルーム立て、ルーム参加のテスト", () => {
    // トピックの設定
    const topics = ArrayRange(10).map((i) => ({ id: i, title: `タイトル${i}`, description: `説明${i}` }))
    // ルームID
    let roomId: string

    test("ユーザーが部屋を立てることができる", (done) => {
      clientSockets[0].emit("BUILD_ROOM", { topics }, (res: any) => {
        expect(res).toEqual({ id: expect.any(String) })
        done()
      })
    })

    test.each([1, 2])("他のユーザー（ユーザー%i）が部屋に参加することができる", (i, done: any) => {
      clientSockets[i].emit("ENTER_ROOM", { room_id: roomId, icon_id: 0 }, (res: any) => {
        expect(res).toEqual({
          comments: [],
          editing_users: [],
          topics: [],
          active_user_count: expect.any(Number)
        })
        done()
      })
    })
  })

  describe("コメント入力周りのテスト", () => {
    test("ユーザーはコメント入力開始のイベントを受け取れる", (done) => {
      clientSockets[1].once("PUB_CHAT_ITEM", (res) => {
        expect(res).toEqual({
          actions: [
            {
              type: "insert-editing",
              content: {
                id: '1',
                topic_id: '0',
                icon_id: '0'
              }
            }
          ]
        })
        done()
      })
      
      clientSockets[0].emit("START_EDIT", {
        id: '1',
        topic_id: '0'
      })
    })

    test("ユーザーはコメント入力終了のイベントを受け取れる", (done) => {
      clientSockets[1].once("PUB_CHAT_ITEM", (res) => {
        expect(res).toEqual({
          actions: [
            {
              type: "remove-editing",
              content: {
                id: '2'
              }
            }
          ]
        })
        done()
      })
      
      clientSockets[0].emit("END_EDIT", {
        id: '2',
        topic_id: '0'
      })
    })

    test("ユーザーはコメント投稿のイベントを受け取れる", (done) => {
      clientSockets[1].once("PUB_CHAT_ITEM", (res) => {
        expect(res).toEqual({
          actions: [
            {
              type: "confirm-to-send",
              content: {
                "id": '3',
                "topic_id": '0',
                "type": "message",
                "icon_id": '1',
                "timestamp": 100,
                "content": 'チャット',
              　"is_question": false
              }
            }
          ]
        })
        done()
      })
      
      clientSockets[0].emit("POST_CHAT_ITEM", {
        type: "message",
        id: '3',
        topic_id: '0',
        content: 'チャット'
      })
    })

    test("ユーザーはリアクション投稿のイベントを受け取れる", (done) => {
      clientSockets[1].once("PUB_CHAT_ITEM", (res) => {
        expect(res).toEqual({
          actions: [
            {
              type: "confirm-to-send",
              content: {
                "id": '4',
                "topic_id": '0',
                "type": "reaction",
                "icon_id": '1',
                "timestamp": 100,
                "target": {
                  id: '3',
                  content: '内容'
                }
              }
            }
          ]
        })
        done()
      })
      
      clientSockets[0].emit("POST_CHAT_ITEM", {
        type: "reaction",
        id: '4',
        topic_id: '0',
        reaction_to_id: '3'
      })
    })
  })
})