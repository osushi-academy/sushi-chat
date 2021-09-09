import IStampDelivery from "../../../domain/stamp/IStampDelivery"
import Stamp from "../../../domain/stamp/Stamp"
import { Server } from "socket.io"

type DeliveredStamp = {
  userId: string
  topicId: string
  timestamp: number
}

class StampDelivery implements IStampDelivery {
  private static stamps: Stamp[] = []
  private static intervalDeliveryTimer: NodeJS.Timeout | null = null

  constructor(private readonly globalSocket: Server) {}

  finishIntervalDelivery(): void {
    if (StampDelivery.intervalDeliveryTimer === null) return

    clearInterval(StampDelivery.intervalDeliveryTimer)
    StampDelivery.intervalDeliveryTimer = null
  }

  startIntervalDelivery(): void {
    if (StampDelivery.intervalDeliveryTimer !== null) return

    StampDelivery.intervalDeliveryTimer = setInterval(() => {
      if (StampDelivery.stamps.length < 1) return

      const stampsPerRoom: Record<string, DeliveredStamp[]> = {}
      for (const s of StampDelivery.stamps) {
        const stamp = {
          userId: s.userId,
          topicId: s.topicId,
          timestamp: s.timestamp,
        }
        if (s.roomId in stampsPerRoom) {
          stampsPerRoom[s.roomId].push(stamp)
        } else {
          stampsPerRoom[s.roomId] = [stamp]
        }
      }

      for (const [roomId, stamps] of Object.entries(stampsPerRoom)) {
        this.globalSocket.to(roomId).emit("PUB_STAMP", stamps)
      }

      StampDelivery.stamps.length = 0
    }, 2000)
  }

  pushStamp(stamp: Stamp): void {
    StampDelivery.stamps.push(stamp)
  }
}

export default StampDelivery
