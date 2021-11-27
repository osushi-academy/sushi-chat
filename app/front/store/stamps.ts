import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { StampModel } from "sushi-chat-shared"
import getUUID from "~/utils/getUUID"
import buildSocket from "~/utils/socketIO"
import { AuthStore } from "~/utils/store-accessor"
import emitAsync from "~/utils/emitAsync"

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

  @Mutation
  public update(s: StampModel) {
    this._stamps = this._stamps.map((item) => (item.id === s.id ? s : item))
  }

  @Action({ rawError: true })
  public addOrUpdate(s: StampModel) {
    if (this._stamps.find(({ id }) => id === s.id)) {
      this.update(s)
    } else {
      this.add(s)
    }
  }

  @Action({ rawError: true })
  public async sendFavorite(topicId: number) {
    const socket = buildSocket(AuthStore.idToken)
    const id = getUUID()
    // StampStoreは配信で追加する
    this.add({
      id,
      topicId,
      timestamp: 1000, // TODO: 正しいタイムスタンプを設定する
      createdAt: new Date().toISOString(),
    })
    await emitAsync(socket, "POST_STAMP", { topicId, id })
  }
}
