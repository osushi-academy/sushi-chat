import { Module, VuexModule, Mutation } from "vuex-module-decorators"

@Module({
  name: "selectedTopicId",
  stateFactory: true,
  namespaced: true,
})
export default class SelectedTopicId extends VuexModule {
  private _id = 1

  public get selectedTopicId(): number {
    return this._id
  }

  @Mutation
  public set(n: number) {
    this._id = n
  }
}
