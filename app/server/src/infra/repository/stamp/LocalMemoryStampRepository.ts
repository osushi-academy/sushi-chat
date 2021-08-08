import IStampRepository from "../../../domain/stamp/IStampRepository"
import Stamp from "../../../domain/stamp/Stamp"

class LocalMemoryStampRepository implements IStampRepository {
  private static instance: LocalMemoryStampRepository
  public static getInstance(): LocalMemoryStampRepository {
    if (!this.instance) {
      this.instance = new LocalMemoryStampRepository()
    }
    return this.instance
  }
  private constructor() {}

  private readonly stamps: Stamp[] = []

  store(stamp: Stamp): void {
    this.stamps.push(stamp)
  }
}

export default LocalMemoryStampRepository
