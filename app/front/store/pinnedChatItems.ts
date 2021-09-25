import { Module, VuexModule, Mutation } from "vuex-module-decorators"

@Module({
  name: "pinnedChatItems",
  stateFactory: true,
  namespaced: true,
})
export default class PinnedChatItems extends VuexModule {
  private _pinnedChatItems:string[] = []
  public get pinnedChatItems():string[]{
    return this._pinnedChatItems
  }
  
  @Mutation
  public add(id:string) {
    this._pinnedChatItems.push(id)
  }

  @Mutation
  public delete(id:string) {
    const idx = this._pinnedChatItems.indexOf(id);
    if(idx>=0){
        this._pinnedChatItems = this._pinnedChatItems.slice(idx,1)
    }
  }
}