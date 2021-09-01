import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import { TopicState } from "~/models/contents"

type TopicStateItem = { [key: string]: TopicState }

@Module({
  name: "topicStateItems",
  stateFactory: true,
  namespaced: true,
})
export default class TopicStateItems extends VuexModule {
  private _topicStateItems: TopicStateItem = {};

  public get topicStateItems(): TopicStateItem {
    return this._topicStateItems
  }

  @Mutation
  public set(t: TopicStateItem) {
    this._topicStateItems = t
  }

  @Mutation
  public change({key, state}: {key: string, state: TopicState}) {
    this._topicStateItems[key] = state
  }
}