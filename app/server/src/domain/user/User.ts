import IconId, { NewIconId } from "./IconId"

class User {
  public static readonly ADMIN_ICON_ID = NewIconId("0")

  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly iconId: IconId,
    public readonly isAdmin: boolean,
  ) {}
}

export default User
