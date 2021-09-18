import IStampDelivery from "../../../domain/stamp/IStampDelivery"
import Stamp from "../../../domain/stamp/Stamp"

class EphemeralStampDelivery implements IStampDelivery {
  private static stamps: Stamp[] = []
  private static intervalDeliveryTimer: NodeJS.Timeout | null = null

  constructor(
    private readonly subscribers: Stamp[][],
    private readonly interval = 100,
  ) {}

  private static finishIntervalDelivery() {
    if (EphemeralStampDelivery.intervalDeliveryTimer === null) return

    clearInterval(EphemeralStampDelivery.intervalDeliveryTimer)
    EphemeralStampDelivery.intervalDeliveryTimer = null
  }

  private startIntervalDelivery() {
    if (EphemeralStampDelivery.intervalDeliveryTimer !== null) return

    EphemeralStampDelivery.intervalDeliveryTimer = setInterval(() => {
      if (EphemeralStampDelivery.stamps.length < 1) {
        EphemeralStampDelivery.finishIntervalDelivery()
        return
      }

      this.subscribers.forEach((s) => s.push(...EphemeralStampDelivery.stamps))
      EphemeralStampDelivery.stamps.length = 0
    }, this.interval)
  }

  public pushStamp(stamp: Stamp) {
    EphemeralStampDelivery.stamps.push(stamp)

    if (EphemeralStampDelivery.intervalDeliveryTimer === null) {
      this.startIntervalDelivery()
    }
  }
}

export default EphemeralStampDelivery
