import { NewIconId } from "../user/IconId"

class Admin {
  public static readonly ICON_ID = NewIconId(0)

  constructor(
    public readonly id: string,
    public readonly name: string,
    private _currentRoomId?: string, // adminは複数のルームを管理しうるが、一度に入室できるルームは一つの想定
  ) {}

  public get currentRoomId() {
    return this._currentRoomId
  }

  public getCurrentRoomIdOrThrow() {
    if (!this._currentRoomId) {
      throw new Error(`currentRoomId of Room(id:${this.id}) is undefined.`)
    }

    return this._currentRoomId
  }

  public enterRoom(roomId: string) {
    this._currentRoomId = roomId
  }

  public leaveRoom() {
    this._currentRoomId = undefined
  }
}

export default Admin
