import { v4 as uuid } from "uuid"
import IRoomRepository from "../../domain/room/IRoomRepository"
import IStampRepository from "../../domain/stamp/IStampRepository"
import Stamp from "../../domain/stamp/Stamp"
import { PostStampCommand } from "./commands"
import IStampDelivery from "../../domain/stamp/IStampDelivery"
import IUserRepository from "../../domain/user/IUserRepository"
import UserService from "../user/UserService"
import IAdminRepository from "../../domain/admin/IAdminRepository"
import Admin from "../../domain/admin/admin"
import RealtimeRoomService from "../room/RealtimeRoomService"

class StampService {
  constructor(
    private readonly stampRepository: IStampRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly adminRepository: IAdminRepository,
    private readonly userRepository: IUserRepository,
    private readonly stampDelivery: IStampDelivery,
  ) {}

  public async post({ userId, topicId }: PostStampCommand) {
    const user = await UserService.findUserOrThrow(
      userId,
      this.adminRepository,
      this.userRepository,
    )
    const roomId =
      user instanceof Admin
        ? user.getCurrentRoomIdOrThrow()
        : user.getRoomIdOrThrow()

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )
    const timestamp = room.calcTimestamp(topicId)

    const stamp = new Stamp(
      uuid(),
      userId,
      roomId,
      topicId,
      new Date(),
      timestamp,
    )
    room.postStamp(stamp)

    this.stampDelivery.pushStamp(stamp)
    this.stampRepository.store(stamp)
  }
}

export default StampService
