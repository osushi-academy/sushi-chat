import IconId, { NewIconId } from "./IconId"

class User {
  public static readonly ADMIN_ICON_ID = NewIconId("0")

  private _roomId: string | null = null
  private _iconId: IconId | null = null
  private _isAdmin = false

  constructor(public readonly id: string) {}

  public get roomId(): string | null {
    return this._roomId
  }

  public getRoomIdOrThrow(): string {
    this.assertIsInRoom(this._roomId)
    return this._roomId
  }

  public get iconId(): IconId | null {
    return this._iconId
  }

  public getIconIdOrThrow(): IconId {
    this.assertHasIconId(this._iconId)
    return this._iconId
  }

  public enterRoom(roomId: string, iconId: IconId): void {
    this._roomId = roomId
    this._iconId = iconId
  }

  public enterRoomAsAdmin(roomId: string, iconId: IconId): void {
    this._roomId = roomId
    this._iconId = iconId
    this._isAdmin = true
  }

  public leaveRoom(): void {
    this.assertIsInRoom(this._roomId)
    this.assertHasIconId(this._iconId)

    this._roomId = null
    this._iconId = null
  }

  private assertIsInRoom(roomId: string | null): asserts roomId is string {
    if (roomId === null) {
      throw new Error(`User(id:${this.id}) is not in any room.`)
    }
  }

  private assertHasIconId(iconId: IconId | null): asserts iconId is IconId {
    if (iconId === null) {
      throw new Error(`User(id:${this.id}) doesn't have iconId.`)
    }
  }
}

export default User
