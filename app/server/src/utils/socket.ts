import { UserSocket } from "../ioServer"

export const retrieveRoomId = (socket: UserSocket): string =>
  socket.rooms.values().next().value
