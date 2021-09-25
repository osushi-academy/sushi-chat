import Stamp from "./Stamp"

interface IStampFactory {
  create(
    userId: string,
    roomId: string,
    topicId: number,
    timestamp: number,
  ): Stamp
}

export default IStampFactory
