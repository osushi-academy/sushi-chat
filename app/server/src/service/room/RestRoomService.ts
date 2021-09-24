import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import {
  ArchiveRoomCommand,
  BuildRoomCommand,
  checkAdminAndfindCommand,
  InviteRoomCommand,
  StartRoomCommand,
} from "./commands"
import IRoomFactory from "../../domain/room/IRoomFactory"
import { RoomModel } from "sushi-chat-shared"

class RestRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomFactory: IRoomFactory,
  ) {}

  // Roomを作成する。
  public async build(command: BuildRoomCommand): Promise<RoomClass> {
    const room = this.roomFactory.create(
      command.adminId,
      command.title,
      command.topics,
      command.description,
    )

    await this.roomRepository.build(room)

    console.log(`new room build: ${room.id}`)

    return room
  }

  // Roomを開始する。
  public async start(command: StartRoomCommand) {
    const room = await this.find(command.id)
    room.startRoom(command.adminId)

    await this.roomRepository.update(room)
  }

  // Roomに管理者を紐付ける
  public async inviteAdmin(command: InviteRoomCommand): Promise<RoomClass> {
    const room = await this.find(command.id)
    room.inviteAdmin(command.adminId, command.adminInviteKey)

    await this.roomRepository.update(room)
    console.log(`new admin invited to room: ${command.id}`)

    return room
  }

  // Roomをアーカイブし、閲覧できなくする。
  public async archive(command: ArchiveRoomCommand) {
    const room = await this.find(command.id)
    await room.archiveRoom(command.adminId)

    await this.roomRepository.update(room)
  }

  // 管理者であるかどうかを確認する
  public async checkAdminAndfind(
    command: checkAdminAndfindCommand,
  ): Promise<RoomModel> {
    const room = await this.find(command.id)
    const isAdmin = room.isAdmin(command.adminId)
    const roomDefault: RoomModel = {
      id: room.id,
      title: room.title,
      topics: room.topics.map((topic) => ({
        ...topic,
        order: topic.id,
      })),
      state: room.state,
      description: room.description,
      startDate: room.startAt?.toISOString() ?? undefined,
      adminInviteKey: undefined,
    }
    // adminの時のみadminInviteKeyに値をいれる
    if (isAdmin) {
      roomDefault.adminInviteKey = room.adminInviteKey
    }

    return roomDefault
  }

  // Roomを探す
  public async find(roomId: string): Promise<RoomClass> {
    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }
}

export default RestRoomService
