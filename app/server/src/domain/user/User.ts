import IconId, { NewIconId } from "./IconId"

class User {
  public static readonly ADMIN_ICON_ID = NewIconId("0")

  constructor(
    public readonly id: string,
    private _roomId: string,
    private _iconId: IconId,
    private _isAdmin: boolean,
  ) {}

  public get roomId(): string {
    return this._roomId
  }

  public get iconId(): IconId {
    return this._iconId
  }

  public get isAdmin(): boolean {
    return this._isAdmin
  }
}

export default User
