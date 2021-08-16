import IUserDelivery from "../../../domain/user/IUserDelivery"
import { Server, Socket } from "socket.io"
import User from "../../../domain/user/User"

class UserDelivery implements IUserDelivery {
  constructor(
    private readonly userSocket: Socket,
    private readonly globalSocket: Server,
  ) {}

  public enterRoom(user: User, activeUserCount: number): void {
    const roomId = user.getRoomIdOrThrow()
    this.userSocket.broadcast.to(roomId).emit("PUB_ENTER_ROOM", {
      iconId: user.iconId,
      activeUserCount,
    })
  }

  public leaveRoom(user: User, activeUserCount: number): void {
    const roomId = user.getRoomIdOrThrow()
    this.globalSocket.to(roomId).emit("PUB_LEAVE_ROOM", {
      iconId: user.iconId,
      activeUserCount,
    })
  }
}

export default UserDelivery
