import { Stamp } from "../../stamp"

interface IStampRepository {
  store(stamp: Stamp): void
}

export default IStampRepository
