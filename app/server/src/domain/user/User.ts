class User {
  public static readonly ADMIN_ICON_ID = "0"

  private _roomId: string | null = null
  private _iconId: string | null = null

  constructor(public readonly id: string) {}

  public get roomId(): string | null {
    return this._roomId
  }

  public get iconId(): string | null {
    return this._iconId
  }

  public enterRoom(roomId: string, iconId: string): void {
    this._roomId = roomId
    this._iconId = iconId
  }
}

export default User
