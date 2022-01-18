import IRoomRepository from "../../domain/room/IRoomRepository"
import IStampRepository from "../../domain/stamp/IStampRepository"
import { PostStampCommand } from "./commands"
import IStampDelivery from "../../domain/stamp/IStampDelivery"
import IUserRepository from "../../domain/user/IUserRepository"
import RealtimeRoomService from "../room/RealtimeRoomService"
import UserService from "../user/UserService"
import IStampFactory from "../../domain/stamp/IStampFactory"

class StampService {
  constructor(
    private readonly stampRepository: IStampRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly stampDelivery: IStampDelivery,
    private readonly stampFactory: IStampFactory,
  ) {}

  public async post({ id, userId, topicId }: PostStampCommand) {
    const user = await UserService.findUserOrThrow(userId, this.userRepository)
    const roomId = user.roomId

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )
    const timestamp = room.calcTimestamp(topicId) as number // NOTE: スタンプはongoing中しか送信できないため as number

    const stamp = this.stampFactory.create(
      id,
      userId,
      roomId,
      topicId,
      timestamp,
    )
    room.postStamp(stamp)

    this.stampDelivery.pushStamp(stamp)
    await this.stampRepository.store(stamp)
  }
}

export default StampService
