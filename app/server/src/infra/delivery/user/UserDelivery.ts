import IUserDelivery from "../../../domain/user/IUserDelivery"
import User from "../../../domain/user/User"
import { GlobalSocket, UserSocket } from "../../../ioServer"

class UserDelivery implements IUserDelivery {
  constructor(
    private readonly userSocket: UserSocket,
    private readonly globalSocket: GlobalSocket,
  ) {}

  public enterRoom(user: User, activeUserCount: number): void {
    const roomId = user.roomId
    this.userSocket.join(roomId)
    this.userSocket.broadcast.to(roomId).emit("PUB_USER_COUNT", {
      activeUserCount,
    })
  }

  public leaveRoom(user: User, activeUserCount: number): void {
    const roomId = user.roomId
    this.userSocket.leave(roomId)
    this.globalSocket.to(roomId).emit("PUB_USER_COUNT", {
      activeUserCount,
    })
  }
}

export default UserDelivery
