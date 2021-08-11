class User {
  public static readonly ADMIN_ICON_ID = "0"

  private _roomId: string | undefined
  private _iconId: string | undefined

  constructor(public readonly id: string) {}

  public get roomId(): string {
    if (this._roomId === undefined) {
      throw new Error("Can't call roomId of User whose roomId is empty.")
    }

    return this._roomId
  }

  public get iconId(): string {
    if (this._iconId === undefined) {
      throw new Error("Can't call iconId of User whose iconId is empty.")
    }

    return this._iconId
  }

  public enterRoom(roomId: string, iconId: string): void {
    this._roomId = roomId
    this._iconId = iconId
  }
}

export default User
