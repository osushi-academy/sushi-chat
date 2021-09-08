import IStampDelivery from "../../../domain/stamp/IStampDelivery"
import Stamp from "../../../domain/stamp/Stamp"

class EphemeralStampDelivery implements IStampDelivery {
  private stamps: Stamp[] = []
  private intervalDeliveryTimer: NodeJS.Timeout | null = null

  constructor(private readonly _subscribers: Stamp[][]) {}

  public get subscribers() {
    return this._subscribers.map((s) => [...s])
  }

  public finishIntervalDelivery(): void {
    if (this.intervalDeliveryTimer === null) return

    clearInterval(this.intervalDeliveryTimer)
    this.intervalDeliveryTimer = null
  }

  public pushStamp(stamp: Stamp): void {
    this.stamps.push(stamp)
  }

  // テストようなのでintervalは短めにしている
  public startIntervalDelivery(): void {
    if (this.intervalDeliveryTimer !== null) return

    this.intervalDeliveryTimer = setInterval(() => {
      if (this.stamps.length > 0) {
        this._subscribers.forEach((s) => s.push(...this.stamps))
        this.stamps.length = 0
      }
    }, 100)
  }
}

export default EphemeralStampDelivery
