import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import { TopicState } from "sushi-chat-shared"

type TopicStateItem = { [key: number]: TopicState }

@Module({
  name: "topicStateItems",
  stateFactory: true,
  namespaced: true,
})
export default class TopicStateItems extends VuexModule {
  private _topicStateItems: TopicStateItem = {}

  public get topicStateItems(): TopicStateItem {
    return this._topicStateItems
  }

  @Mutation
  public set(t: TopicStateItem) {
    this._topicStateItems = t
  }

  @Mutation
  public change({ key, state }: { key: number; state: TopicState }) {
    this._topicStateItems = { ...this._topicStateItems, [key]: state }
  }
}
