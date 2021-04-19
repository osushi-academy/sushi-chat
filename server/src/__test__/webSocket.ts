import { createServer, Server as HttpServer } from 'http'
import { Server, Socket as ServerSocket } from 'socket.io'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'

const createCustomServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer)
  io.on('connection', (socket) => {
    socket.on("hello", ({ username }) => {
      socket.emit('hello-return', `hello, ${username}!!`)
    })
  })
  return io
}

describe('WebSocketのテスト', () => {
  let io: Server
  let clientSocket: ClientSocket

  beforeAll((done) => {
    const httpServer = createServer()
    io = createCustomServer(httpServer)
    httpServer.listen(() => {
      const port = (httpServer as any).address().port
      clientSocket = Client(`http://localhost:${port}`)
      clientSocket.on("connect", done)
    })
  })

  afterAll(() => {
    io.close()
    clientSocket.close()
  })

  test("Hello test", (done) => {
    clientSocket.on("hello-return", (arg: string) => {
      expect(arg).toBe("hello, Alice!!")
      done()
    })
    clientSocket.emit("hello", { username: "Alice" })
  });
})