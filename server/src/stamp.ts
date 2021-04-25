import { Server } from "socket.io";

export type Stamp = {
  userId: string;
  topicId: string;
  timestamp: number;
};

export function stampIntervalSender(io: Server, stamps: Stamp[]) {
  return setInterval(() => {
    if (stamps.length > 0) {
      io.sockets.emit("PUB_STAMP", stamps);
      stamps.length = 0;
    }
  }, 2000);
}
