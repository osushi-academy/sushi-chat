import User from "./User"
import Admin from "../admin/admin"

interface IUserDelivery {
  enterRoom(user: User | Admin, activeUserCount: number): void
  leaveRoom(user: User | Admin, activeUserCount: number): void
}

export default IUserDelivery
