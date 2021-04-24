import { Server } from "socket.io";

export type Stamp = {
  topicId: string;
};

export function stampIntervalSender(io: Server, stamps: Stamp[]) {
  return setInterval(() => {
    if (stamps.length > 0) {
      io.sockets.emit("PUB_STAMP", stamps);
      stamps.length = 0;
      console.log("inner stamp", new Date());
    }
    console.log("onter stamp", new Date());
  }, 2000);
}
