/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import ChatItems from '~/store/chatItems'

let ChatItemStore: ChatItems
function initialiseStores(store: Store<any>): void {
  ChatItemStore = getModule(ChatItems, store)
}

export { initialiseStores, ChatItemStore }
