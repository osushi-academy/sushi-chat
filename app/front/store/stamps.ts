import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { Stamp } from "~/models/contents"
import socket from "~/utils/socketIO"

@Module({
  name: "stamps",
  stateFactory: true,
  namespaced: true,
})
export default class Stamps extends VuexModule {
  private _stamps: Stamp[] = []

  public get stamps(): Stamp[] {
    return this._stamps
  }

  @Mutation
  public add(s: Stamp) {
    this._stamps.push(s)
  }

  @Action({ rawError: true })
  public sendFavorite(topicId: string) {
    this.add({userId: socket.id, topicId})
    socket.emit("POST_STAMP", { topicId })
  }
}
