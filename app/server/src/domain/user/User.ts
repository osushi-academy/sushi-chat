import IconId, { NewIconId } from "./IconId"

class User {
  public static readonly ADMIN_ICON_ID = NewIconId("0")

  constructor(
    public readonly id: string,
    private _roomId: string | null,
    private _iconId: IconId | null,
    private _isAdmin: boolean | null,
  ) {}

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

  public get isAdmin(): boolean | null {
    return this._isAdmin
  }

  public getIsAdminOrThrow(): boolean {
    this.assertHasIsAdmin(this._isAdmin)
    return this._isAdmin
  }

  public leaveRoom(): void {
    this.assertIsInRoom(this._roomId)
    this.assertHasIconId(this._iconId)

    this._roomId = null
    this._iconId = null
    this._isAdmin = null
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

  private assertHasIsAdmin(
    isAdmin: boolean | null,
  ): asserts isAdmin is boolean {
    if (isAdmin === null) {
      throw new Error(`User(id:${this.id}) doesn't have admin status.`)
    }
  }
}

export default User
