import IStampDelivery from "../../../domain/stamp/IStampDelivery"
import Stamp from "../../../domain/stamp/Stamp"
import { Server } from "socket.io"

type DeliveredStamp = {
  userId: string
  topicId: string
  timestamp: number
}

class StampDelivery implements IStampDelivery {
  private static instance: StampDelivery
  public static getInstance(globalSocket: Server): StampDelivery {
    if (!this.instance) {
      this.instance = new StampDelivery(globalSocket)
    }
    return this.instance
  }

  private stamps: Stamp[] = []
  private intervalDeliveryTimer: NodeJS.Timeout | null = null

  private constructor(private readonly globalSocket: Server) {}

  finishIntervalDelivery(): void {
    if (this.intervalDeliveryTimer === null) return

    clearInterval(this.intervalDeliveryTimer)
    this.intervalDeliveryTimer = null
  }

  startIntervalDelivery(): void {
    if (this.intervalDeliveryTimer !== null) return

    this.intervalDeliveryTimer = setInterval(() => {
      if (this.stamps.length < 1) return

      const stampsPerRoom: Record<string, DeliveredStamp[]> = {}
      for (const s of this.stamps) {
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

      this.stamps.length = 0
    }, 2000)
  }

  pushStamp(stamp: Stamp): void {
    this.stamps.push(stamp)
  }
}

export default StampDelivery
