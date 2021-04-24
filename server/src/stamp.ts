import { Server } from "socket.io";

export type Stamp = {
  topicId: string;
};

export function stampIntervalSender(io: Server, stamps: Stamp[]) {
  setInterval(() => {
    io.sockets.emit("PUB_STAMP", stamps);
    stamps.length = 0;
  }, 2000);
}