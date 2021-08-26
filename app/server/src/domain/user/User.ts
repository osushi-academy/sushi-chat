class User {
  public static readonly ADMIN_ICON_ID = "0"

  private _roomId: string | null = null
  private _iconId: string | null = null

  constructor(public readonly id: string) {}

  public get roomId(): string | null {
    return this._roomId
  }

  public getRoomIdOrThrow(): string {
    this.assertIsInRoom()
    return this._roomId as string
  }

  public get iconId(): string | null {
    return this._iconId
  }

  public getIconIdOrThrow(): string {
    this.assertHasIconId()
    return this._iconId as string
  }

  public enterRoom(roomId: string, iconId: string): void {
    this._roomId = roomId
    this._iconId = iconId
  }

  public leaveRoom(): void {
    this.assertIsInRoom()
    this.assertHasIconId()

    this._roomId = null
    this._iconId = null
  }

  private assertIsInRoom(): void {
    if (this._roomId === null) {
      throw new Error(`User(id:${this.id}) is not in any room.`)
    }
  }

  private assertHasIconId(): void {
    if (this._iconId === null) {
      throw new Error(`User(id:${this.id}) doesn't have iconId.`)
    }
  }
}

export default User
