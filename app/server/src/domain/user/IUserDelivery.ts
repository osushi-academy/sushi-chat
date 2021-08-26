import User from "./User"

interface IUserDelivery {
  enterRoom(user: User, activeUserCount: number): void
  leaveRoom(user: User, activeUserCount: number): void
}

export default IUserDelivery
