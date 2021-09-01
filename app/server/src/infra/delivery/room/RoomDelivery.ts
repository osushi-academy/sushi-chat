import IRoomDelivery from "../../../domain/room/IRoomDelivery"
import { ChangeTopicStateType } from "../../../events"
import { Server } from "socket.io"

class RoomDelivery implements IRoomDelivery {
  constructor(private readonly globalSocket: Server) {}

  public start(roomId: string) {
    this.globalSocket.to(roomId).emit("PUB_START_ROOM", {})
  }

  public finish(roomId: string) {
    this.globalSocket.to(roomId).emit("PUB_FINISH_ROOM", {})
  }

  public close(roomId: string) {
    this.globalSocket.to(roomId).emit("PUB_CLOSE_ROOM", {})
  }

  public changeTopicState(
    type: ChangeTopicStateType,
    roomId: string,
    topicId: string,
  ): void {
    this.globalSocket
      .to(roomId)
      .emit("PUB_CHANGE_TOPIC_STATE", { type, topicId })
  }
}

export default RoomDelivery
