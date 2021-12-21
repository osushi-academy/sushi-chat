import { Module, VuexModule, Mutation } from "vuex-module-decorators"

@Module({
  name: "selectedTopicId",
  stateFactory: true,
  namespaced: true,
})
export default class SelectedTopicId extends VuexModule {
  private _topics = 1

  public get selectedTopicId(): number {
    return this._topics
  }

  @Mutation
  public set(n: number) {
    this._topics = n
  }
}
