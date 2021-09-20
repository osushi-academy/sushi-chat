import IRoomRepository from "../../domain/room/IRoomRepository"
import { ChangeTopicStateCommand, FinishRoomCommand } from "./commands"
import IChatItemDelivery from "../../domain/chatItem/IChatItemDelivery"
import IRoomDelivery from "../../domain/room/IRoomDelivery"
import IChatItemRepository from "../../domain/chatItem/IChatItemRepository"
import IAdminRepository from "../../domain/admin/IAdminRepository"

class RealtimeRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly adminRepository: IAdminRepository,
    private readonly chatItemRepository: IChatItemRepository,
    private readonly roomDelivery: IRoomDelivery,
    private readonly chatItemDelivery: IChatItemDelivery,
  ) {}

  /**
   * idからroomを取得。存在しなければエラーを投げる
   * @param roomId
   * @param roomRepository
   */
  public static async findRoomOrThrow(
    roomId: string,
    roomRepository: IRoomRepository,
  ) {
    const room = await roomRepository.find(roomId)
    if (!room) {
      throw new Error(`Room(id:${roomId}) was not found.`)
    }
    return room
  }

  /** Roomを終了して投稿できなくする。閲覧は可能。
   *  Adminのみ実行可能
   *  @param roomId
   *  @param adminId
   */
  public async finish({ roomId, adminId }: FinishRoomCommand) {
    await this.validateAdmin(adminId, roomId)

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )

    room.finishRoom()

    this.roomRepository.update(room)
  }

  /** topicのstateを変更する
   *  Adminのみ実行可能
   *  @param roomId
   *  @param topicId
   *  @param adminId
   *  @param state
   */
  public async changeTopicState({
    roomId,
    topicId,
    adminId,
    state,
  }: ChangeTopicStateCommand) {
    await this.validateAdmin(adminId, roomId)

    const room = await RealtimeRoomService.findRoomOrThrow(
      roomId,
      this.roomRepository,
    )
    const messages = room.changeTopicState(topicId, state)

    this.roomDelivery.changeTopicState(roomId, room.topics[topicId])
    this.roomRepository.update(room)

    for (const m of messages) {
      this.chatItemDelivery.postMessage(m)
      this.chatItemRepository.saveMessage(m)
    }
  }

  private async validateAdmin(adminId: string, roomId: string): Promise<void> {
    const admin = await this.adminRepository.find(adminId)
    if (!admin) {
      throw new Error(`Admin(id:${adminId}) was not found.`)
    }
    if (!admin.managedRoomsIds || !(roomId in admin.managedRoomsIds)) {
      throw new Error(
        `Room(id${roomId}) is not managed by Admin(id:${adminId}).`,
      )
    }
  }
}

export default RealtimeRoomService
