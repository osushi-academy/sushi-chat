import IconId, { NewIconId } from "./IconId"

class User {
  public static readonly ADMIN_ICON_ID = NewIconId(0)
  public static readonly SYSTEM_USER_ICON_ID = NewIconId(0)

  constructor(
    public readonly id: string,
    public readonly isAdmin: boolean,
    public readonly isSystem: boolean,
    public readonly roomId: string,
    public readonly iconId: IconId,
    public readonly speakAt?: number,
  ) {}
}

export default User
