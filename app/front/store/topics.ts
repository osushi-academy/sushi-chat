import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import { Topic } from "sushi-chat-shared"

@Module({
  name: "topics",
  stateFactory: true,
  namespaced: true,
})
export default class Topics extends VuexModule {
  private _topics: Topic[] = []

  public get topics(): Topic[] {
    return this._topics
  }

  @Mutation
  public set(t: Topic[]) {
    this._topics = t
  }
}
