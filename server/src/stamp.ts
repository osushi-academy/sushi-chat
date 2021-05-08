import { BroadcastOperator, Server } from "socket.io";

export type Stamp = {
  userId: string;
  topicId: string;
  timestamp: number;
};

export function stampIntervalSender(
  socket: Server,
  roomId: string,
  stamps: Stamp[]
) {
  return setInterval(() => {
    if (stamps.length > 0) {
      socket.to(roomId).emit("PUB_STAMP", stamps);
      stamps.length = 0;
    }
  }, 2000);
}
