import { createServer, Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { ArrayRange } from '../utils/range'

// TODO: 本来はサーバーサイドの本実装におきかわる部分
const createCustomServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer)
  io.on('connection', (socket) => {
    socket.on("HELLO", ({ username }) => {
      socket.emit('HELLO_REPLY', `hello, ${username}!!`)
    })
  })
  return io
}

describe('WebSocketのテスト', () => {
  const CLIENTS_COUNT = 3

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

  // おうむ返しテスト
  test("Hello test", (done) => {
    clientSockets[0].on("HELLO_REPLY", (arg: string) => {
      expect(arg).toBe("hello, Alice!!")
      done()
    })
    clientSockets[0].emit("HELLO", { username: "Alice" })
  });
})