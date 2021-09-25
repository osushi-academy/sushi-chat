import { v4 as uuid } from "uuid"
import IUserFactory from "../../domain/user/IUserFactory"
import SystemUser from "../../domain/user/SystemUser"

class UserFactory implements IUserFactory {
  createSystemUser(roomId: string): SystemUser {
    const systemUserId = uuid()
    return new SystemUser(systemUserId, roomId)
  }
}

export default UserFactory
