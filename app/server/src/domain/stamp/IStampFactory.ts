import Stamp from "./Stamp"

interface IStampFactory {
  create(
    id: string,
    userId: string,
    roomId: string,
    topicId: number,
    timestamp: number,
  ): Stamp
}

export default IStampFactory
