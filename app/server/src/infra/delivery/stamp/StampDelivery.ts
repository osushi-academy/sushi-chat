import IStampDelivery from "../../../domain/stamp/IStampDelivery"
import Stamp from "../../../domain/stamp/Stamp"
import { StampModel } from "sushi-chat-shared"
import { GlobalSocket } from "../../../ioServer"

class StampDelivery implements IStampDelivery {
  private static stamps: Stamp[] = []
  private static intervalDeliveryTimer: NodeJS.Timeout | null = null

  /**
   * @param globalSocket stampの配信に使うSocket.IOのServer
   * @param interval stampを送信するインターバル[millisecond]
   */
  constructor(
    private readonly globalSocket: GlobalSocket,
    private readonly interval = 2000,
  ) {}

  private static finishIntervalDelivery() {
    if (StampDelivery.intervalDeliveryTimer === null) return

    clearInterval(StampDelivery.intervalDeliveryTimer)
    StampDelivery.intervalDeliveryTimer = null
  }

  private startIntervalDelivery() {
    if (StampDelivery.intervalDeliveryTimer !== null) return

    StampDelivery.intervalDeliveryTimer = setInterval(() => {
      // 配信するstampが無かったら配信タイマーを停止する
      if (StampDelivery.stamps.length < 1) {
        StampDelivery.finishIntervalDelivery()
        return
      }

      const stampsPerRoom: Record<string, StampModel[]> = {}
      for (const s of StampDelivery.stamps) {
        const stamp: StampModel = {
          id: s.id,
          topicId: s.topicId,
          timestamp: s.timestamp,
          createdAt: s.createdAt.toISOString(),
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

      // 送信したstampは削除
      StampDelivery.stamps.length = 0
    }, this.interval)
  }

  public pushStamp(stamp: Stamp): void {
    StampDelivery.stamps.push(stamp)

    // 配信タイマーが起動していなかったら起動する
    if (StampDelivery.intervalDeliveryTimer === null) {
      this.startIntervalDelivery()
    }
  }
}

export default StampDelivery
