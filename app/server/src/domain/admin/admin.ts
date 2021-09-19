import { NewIconId } from "../user/IconId"

class Admin {
  public static readonly ICON_ID = NewIconId(0)

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly managedRoomsIds: string[],
  ) {}
}

export default Admin
