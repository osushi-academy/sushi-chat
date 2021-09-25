import SystemUser from "./SystemUser"

interface IUserFactory {
  createSystemUser(roomId: string): SystemUser
}

export default IUserFactory
