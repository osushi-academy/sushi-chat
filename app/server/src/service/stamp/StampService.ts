import IRoomRepository from "../../domain/room/IRoomRepository"
import IStampRepository from "../../domain/stamp/IStampRepository"
import { PostStampCommand } from "./commands"
import IStampDelivery from "../../domain/stamp/IStampDelivery"
import IUserRepository from "../../domain/user/IUserRepository"
import IStampFactory from "../../domain/stamp/IStampFactory"
import { ErrorWithCode, NotFoundError, StateError } from "../../error"

class StampService {
  constructor(
    private readonly stampRepository: IStampRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly stampDelivery: IStampDelivery,
    private readonly stampFactory: IStampFactory,
  ) {}

  public async post({ id, userId, topicId }: PostStampCommand) {
    const user = await this.userRepository.find(userId)
    if (!user) {
      throw new ErrorWithCode(`User(${userId}) was not found.`, 404)
    }
    const roomId = user.roomId

    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new ErrorWithCode(`Room(${roomId}) was not found.`, 404)
    }

    let timestamp: number | null
    try {
      timestamp = room.calcTimestamp(topicId)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new ErrorWithCode(e.message, 404)
      } else {
        throw new Error(e.message)
      }
    }

    if (timestamp === null) {
      throw new ErrorWithCode(
        `timestamp of Topic(${topicId}) of Room(${roomId}) must not be null.`,
        400,
      )
    }

    const stamp = this.stampFactory.create(
      id,
      userId,
      roomId,
      topicId,
      timestamp,
    )
    try {
      room.postStamp(stamp)
    } catch (e) {
      if (e instanceof StateError) {
        throw new ErrorWithCode(e.message, 400)
      } else if (e instanceof NotFoundError) {
        // userがroomに属していなかった場合
        throw new ErrorWithCode(e.message, 400)
      } else {
        throw new Error(e.message)
      }
    }

    this.stampDelivery.pushStamp(stamp)
    await this.stampRepository.store(stamp)
  }
}

export default StampService
