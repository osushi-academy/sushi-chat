import { Module, VuexModule, Mutation } from "vuex-module-decorators"

@Module({
  name: "showSidebar",
  stateFactory: true,
  namespaced: true,
})
export default class ShowSidebar extends VuexModule {
  private _show = true

  public get showSidebar(): boolean {
    return this._show
  }

  @Mutation
  public set(b: boolean) {
    this._show = b
  }
}
