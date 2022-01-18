import { io, Socket } from "socket.io-client"
import { ServerListenEventsMap, ServerPubEventsMap } from "sushi-chat-shared"
import getIdToken from "./getIdToken"

export type SocketIOType = Socket<ServerPubEventsMap, ServerListenEventsMap>

let socket: SocketIOType | null = null

const buildSocket = async (
  asAdmin: boolean,
): Promise<Socket<ServerPubEventsMap, ServerListenEventsMap>> => {
  const idToken = !asAdmin ? null : await getIdToken()

  // NOTE: キャッシュがあれば返す
  if (
    socket != null &&
    "token" in socket.auth &&
    socket.auth.token === idToken
  ) {
    return socket
  }

  socket = io(process.env.apiBaseUrl as string, {
    auth: {
      token: idToken || null,
    },
    withCredentials: true,
  })
  return socket
}
export default buildSocket
