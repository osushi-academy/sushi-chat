import Stamp from "./Stamp"

interface IStampRepository {
  store(stamp: Stamp): void
}

export default IStampRepository
