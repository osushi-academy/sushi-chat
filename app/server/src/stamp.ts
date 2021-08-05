import { Server } from "socket.io"
import { insertStamps } from "./database/database"
import { Client } from "pg"

export type Stamp = {
  userId: string
  topicId: string
  timestamp: number
}

export function stampIntervalSender(
  client: Client,
  socket: Server,
  roomId: string,
  stamps: Stamp[],
) {
  return setInterval(() => {
    if (stamps.length > 0) {
      socket.to(roomId).emit("PUB_STAMP", stamps)
      insertStamps(client, stamps, roomId)
      stamps.length = 0
    }
  }, 2000)
}
