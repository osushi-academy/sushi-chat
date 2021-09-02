import RoomClass from "../room/Room"

class User {
  public static readonly ADMIN_ICON_ID = "0"

  private _roomId: string | null = null
  private _iconId: string | null = null

  constructor(public readonly id: string) {}

  public get roomId(): string | null {
    return this._roomId
  }

  public getRoomIdOrThrow(): string {
    this.assertIsInRoom(this._roomId)
    return this._roomId
  }

  public get iconId(): string | null {
    return this._iconId
  }

  public getIconIdOrThrow(): string {
    this.assertHasIconId(this._iconId)
    return this._iconId
  }

  public enterRoom(roomId: string, iconId: string): void {
    this._roomId = roomId
    this._iconId = iconId
  }

  public leaveRoom(): void {
    this.assertIsInRoom(this._roomId)
    this.assertHasIconId(this._iconId)

    this._roomId = null
    this._iconId = null
  }

  // NOTE: こうするとasを撲滅できる.（純関数になるので切り出しても良いかも?）
  //       が、毎度引数を指定する必要があってめんどいのでそこまでやるメリットがあるかと言われれば...
  private assertIsInRoom(roomId: string | null): asserts roomId is string {
    if (roomId === null) {
      throw new Error(`User(id:${this.id}) is not in any room.`)
    }
  }

  private assertHasIconId(iconId: string | null): asserts iconId is string {
    if (iconId === null) {
      throw new Error(`User(id:${this.id}) doesn't have iconId.`)
    }
  }
}

export default User
