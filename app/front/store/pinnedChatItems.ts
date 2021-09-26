import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { AuthStore } from "~/store"
import buildSocket from "~/utils/socketIO"

@Module({
  name: "pinnedChatItems",
  stateFactory: true,
  namespaced: true,
})
export default class PinnedChatItems extends VuexModule {
  private _pinnedChatItems: string[] = []
  public get pinnedChatItems(): string[] {
    return this._pinnedChatItems
  }

  @Mutation
  public add(id: string) {
    this._pinnedChatItems.push(id)
  }

  @Mutation
  public delete(id: string) {
    const idx = this._pinnedChatItems.indexOf(id)
    if (idx >= 0) {
      this._pinnedChatItems.splice(idx, 1)
    }
  }

  @Action({ rawError: true })
  public send({
    topicId, 
    chatItemId, 
  }: {
    topicId: number,
    chatItemId: string, 
  }) {
    const socket = buildSocket(AuthStore.idToken)
    socket.emit(
      "POST_PINNED_MESSAGE",
      {
        topicId,
        chatItemId,
      },
      (res: any) => {
        console.log(res)
      },
    )
  }
}
