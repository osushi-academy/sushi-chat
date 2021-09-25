import { io, Socket } from "socket.io-client"
import { ServerListenEventsMap, ServerPubEventsMap } from "sushi-chat-shared"

// 型自体もexportしておく
export type SocketIOType = Socket<ServerPubEventsMap, ServerListenEventsMap>

let socket: SocketIOType | null = null

const buildSocket = (
  idToken?: string | null,
): Socket<ServerPubEventsMap, ServerListenEventsMap> => {
  socket =
    socket ??
    io(process.env.apiBaseUrl as string, {
      auth: {
        token: idToken || null,
      },
      withCredentials: true,
    })
  return socket
}
export default buildSocket
