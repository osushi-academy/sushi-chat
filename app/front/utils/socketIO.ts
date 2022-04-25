import { io, Socket } from "socket.io-client"
import { ServerListenEventsMap, ServerPubEventsMap } from "sushi-chat-shared"
import getIdToken from "./getIdToken"

export type SocketIOType = Socket<ServerPubEventsMap, ServerListenEventsMap>

let socket: SocketIOType | null = null

const buildSocket = async (
  asAdmin: boolean,
): Promise<Socket<ServerPubEventsMap, ServerListenEventsMap>> => {
  // NOTE: キャッシュがあれば返す
  if (socket != null) {
    return socket
  }

  const idToken = !asAdmin ? null : await getIdToken()

  socket = io(process.env.apiBaseUrl as string, {
    auth: {
      token: idToken || null,
    },
    withCredentials: true,
  })
  return socket
}
export default buildSocket
