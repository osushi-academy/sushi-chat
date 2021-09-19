import IconId from "./IconId"

class User {
  constructor(
    public readonly id: string,
    private _roomId?: string,
    private _iconId?: IconId,
    private _speakAt?: number,
  ) {}

  public get roomId(): string | undefined {
    return this._roomId
  }

  public getRoomIdOrThrow(): string {
    this.assertIsInRoom(this._roomId)
    return this._roomId as string
  }

  public get iconId(): IconId | undefined {
    return this._iconId
  }

  public getIconIdOrThrow(): IconId {
    this.assertHasIconId(this._iconId)
    return this._iconId
  }

  public get speakAt(): number | undefined {
    return this._speakAt
  }

  public enterRoom(roomId: string, iconId: IconId, speakAt?: number): void {
    this._roomId = roomId
    this._iconId = iconId
    this._speakAt = speakAt
  }

  public leaveRoom(): void {
    this.assertIsInRoom()
    this.assertHasIconId()

    // TODO: これらの値をundefinedにして保存してしまうと、userがroomにいた履歴が消えてしまう。
    //        hasLeftみたいなフラグをつけるようにすれば良いかも
    // this._roomId = undefined
    // this._iconId = undefined
    // this._speakAt = undefined
  }

  private assertIsInRoom(roomId?: string): asserts roomId is string {
    if (roomId === null) {
      throw new Error(`User(id:${this.id}) is not in any room.`)
    }
  }

  private assertHasIconId(iconId?: IconId): asserts iconId is IconId {
    if (iconId === null) {
      throw new Error(`User(id:${this.id}) doesn't have iconId.`)
    }
  }
}

export default User
