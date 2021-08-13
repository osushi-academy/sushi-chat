import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import socket from "~/utils/socketIO"
import { Topic, TopicState } from "@/models/contents"

type TopicItem = {
  topics: Topic[]
  topicStates: {[topicId: string]: TopicState }
}

@Module({
  name: 'topicItems',
  stateFactory: true,
  namespaced: true,
})
export default class TopicItems extends VuexModule {
  private _topicItems: TopicItem = { topics: [], topicStates: {} }

  public get topicItems(): TopicItem {
    return this._topicItems
  }

  @Mutation
  public setTopics(topics: Topic[]) {
    this._topicItems.topics = topics
  }

  @Mutation
  public changeTopicState(topicId: string, state: TopicState) {
    this._topicItems.topicStates[topicId] = state
  }

  @Action({ rawError: true })
  public postTopicState(roomId: string, topicId: string, state: TopicState) {
    if (state === "not-started") {
      return
    }
    // ローカルでState変更
    this.changeTopicState(topicId, state)
    // サーバーに反映
    socket.emit("ADMIN_CHANGE_TOPIC_STATE", {
      roomId,
      type:
        state === "active" ? "OPEN" : state === "paused" ? "PAUSE" : "CLOSE",
      topicId,
    })
  }
}