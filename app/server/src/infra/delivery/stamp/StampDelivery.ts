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
      if (this.stamps.length > 0) {
        // TODO: 動作未確認なんだけど、this.stampsに複数のルームのスタンプ情報入ることってないっけ？
        const roomId = this.stamps[0].roomId
        const deliveredStamps: DeliveredStamp[] = this.stamps.map((s) => ({
          userId: s.userId,
          topicId: s.topicId,
          timestamp: s.timestamp,
        }))
        this.globalSocket.to(roomId).emit("PUB_STAMP", deliveredStamps)
        this.stamps.length = 0
      }
    }, 2000)
  }

  pushStamp(stamp: Stamp): void {
    this.stamps.push(stamp)
  }
}

export default StampDelivery
