import User from "./User"

class SystemUser extends User {
  constructor(id: string, roomId: string) {
    super(id, false, true, roomId, User.SYSTEM_USER_ICON_ID)
  }
}

export default SystemUser
