import Stamp from "./Stamp"

interface IStampDelivery {
  startIntervalDelivery(): void
  finishIntervalDelivery(): void
  pushStamp(stamp: Stamp): void
}

export default IStampDelivery
