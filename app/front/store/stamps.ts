import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { StampModel } from "sushi-chat-shared"
import getUUID from "~/utils/getUUID"
import buildSocket from "~/utils/socketIO"
import { AuthStore } from "~/utils/store-accessor"

@Module({
  name: "stamps",
  stateFactory: true,
  namespaced: true,
})
export default class Stamps extends VuexModule {
  private _stamps: StampModel[] = []

  public get stamps(): StampModel[] {
    return this._stamps
  }

  @Mutation
  public add(s: StampModel) {
    this._stamps.push(s)
  }

  @Action({ rawError: true })
  public sendFavorite(topicId: number) {
    const socket = buildSocket(AuthStore.idToken)
    this.add({
      id: getUUID(),
      topicId,
      timestamp: 1000, // TODO: 正しいタイムスタンプを設定する
      createdAt: new Date().toISOString(),
    })
    socket.emit("POST_STAMP", { topicId }, (res: any) => {
      console.log(res)
    })
  }
}
