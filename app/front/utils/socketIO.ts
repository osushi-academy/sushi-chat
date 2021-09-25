import { io, Socket } from "socket.io-client"
import { ServerListenEventsMap, ServerPubEventsMap } from "sushi-chat-shared"
const buildSocket = (idToken?: string | null): Socket<ServerPubEventsMap, ServerListenEventsMap> =>
    io(process.env.apiBaseUrl as string, {
      auth: {
        token: idToken || null,
      },
      withCredentials: true,
  }
)
export default buildSocket

// 型自体もexportしておく
export type SocketIOType = Socket<ServerPubEventsMap, ServerListenEventsMap>