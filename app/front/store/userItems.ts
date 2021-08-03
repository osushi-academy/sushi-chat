import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

type UserItem = {
  myIconId: number
  isAdmin: boolean
}

@Module({
  name: 'userItems',
  stateFactory: true,
  namespaced: true,
})
export default class UserItems extends VuexModule {
  private _userItems: UserItem = { myIconId: -1, isAdmin: false }

  public get userItems(): UserItem {
    return this._userItems
  }

  @Mutation
  public changeMyIcon(index: number) {
    this._userItems.myIconId = index
  }

  @Mutation
  public changeIsAdmin(state: boolean) {
    this._userItems.isAdmin = state
  }
}
