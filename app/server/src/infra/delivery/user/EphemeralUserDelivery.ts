import IUserDelivery from "../../../domain/user/IUserDelivery"
import User from "../../../domain/user/User"

export type DeliveryType = "ENTER" | "LEAVE"

class EphemeralUserDelivery implements IUserDelivery {
  constructor(
    private readonly _subscribers: {
      type: DeliveryType
      content: Record<string, unknown>
    }[][],
  ) {}

  public get subscribers() {
    return this._subscribers.map((s) => [...s])
  }

  public enterRoom(user: User, activeUserCount: number): void {
    this._subscribers.forEach((s) =>
      s.push({ type: "ENTER", content: { user, activeUserCount } }),
    )
  }

  public leaveRoom(user: User, activeUserCount: number): void {
    this._subscribers.forEach((s) =>
      s.push({ type: "LEAVE", content: { user, activeUserCount } }),
    )
  }
}

export default EphemeralUserDelivery
