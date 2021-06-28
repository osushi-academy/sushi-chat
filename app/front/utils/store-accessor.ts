/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import ChatItems from '~/store/chatItems'
import Device from '~/store/device'
import UserItems from '~/store/userItems'

let ChatItemStore: ChatItems
let DeviceStore: Device
let UserItemStore: UserItems
function initialiseStores(store: Store<any>): void {
  ChatItemStore = getModule(ChatItems, store)
  DeviceStore = getModule(Device, store)
  UserItemStore = getModule(UserItems, store)
}

export { initialiseStores, ChatItemStore, DeviceStore, UserItemStore }
