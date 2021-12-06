import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import { RoomModel, RoomState } from "sushi-chat-shared"

@Module({
  name: "room",
  stateFactory: true,
  namespaced: true,
})
export default class Room extends VuexModule {
  private _room: RoomModel = {
    id: "",
    title: "",
    topics: [],
    state: 'not-started',
    description: undefined,
    startDate: undefined,
    adminInviteKey: "undefined",
  }

  public get room(): RoomModel {
    return this._room
  }

  @Mutation
  public set(room: RoomModel) {
    this._room = room
  }

  @Mutation
  public setId(id: string) {
    this._room.id = id
  }

  @Mutation
  public setState(state: RoomState) {
    this._room.state = state
  }
}
