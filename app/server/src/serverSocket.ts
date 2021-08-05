import { Socket } from "socket.io"
import { SendEventBody, SendEventName } from "./events"

export interface IServerSocket {
  id: string
  broadcast: <EventName extends SendEventName>(
    eventName: EventName,
    body: SendEventBody<EventName>,
  ) => void
}

class ServerSocket implements IServerSocket {
  constructor(
    private readonly socket: Socket,
    private readonly roomId: string,
  ) {
    this.socket.join(roomId)
  }

  public get id(): string {
    return this.socket.id
  }

  public broadcast = (
    eventName: SendEventName,
    body: SendEventBody<typeof eventName>,
  ) => {
    this.socket.broadcast.to(this.roomId).emit(eventName, body)
  }
}

export default ServerSocket
