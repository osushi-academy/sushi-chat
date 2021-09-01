import IStampDelivery from "../../../domain/stamp/IStampDelivery"
import Stamp from "../../../domain/stamp/Stamp"

class EphemeralStampDelivery implements IStampDelivery {
  private stamps: Stamp[] = []
  private intervalDeliveryTimer: NodeJS.Timeout | null = null

  constructor(private readonly subscribers: Stamp[][]) {}

  finishIntervalDelivery(): void {
    if (this.intervalDeliveryTimer === null) {
      throw new Error(
        "Can't finish StampDelivery whose intervalDeliveryTimer is empty.",
      )
    }
    clearInterval(this.intervalDeliveryTimer)
    this.intervalDeliveryTimer = null
  }

  pushStamp(stamp: Stamp): void {
    this.stamps.push(stamp)
  }

  startIntervalDelivery(): void {
    if (this.intervalDeliveryTimer !== null) return

    this.intervalDeliveryTimer = setInterval(() => {
      if (this.stamps.length > 0) {
        this.subscribers.forEach((s) => s.push(...this.stamps))
        this.stamps.length = 0
      }
    }, 2000)
  }
}

export default EphemeralStampDelivery
