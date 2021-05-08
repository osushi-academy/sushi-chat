import { BroadcastOperator } from "socket.io";

export type Stamp = {
  userId: string;
  topicId: string;
  timestamp: number;
};

export function stampIntervalSender(
  socket: BroadcastOperator<any>,
  stamps: Stamp[]
) {
  return setInterval(() => {
    if (stamps.length > 0) {
      socket.emit("PUB_STAMP", stamps);
      stamps.length = 0;
    }
  }, 2000);
}
