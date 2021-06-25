/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import ChatItems from '~/store/chatItems'
import Device from '~/store/device'

let ChatItemStore: ChatItems
let DeviceStore: Device
function initialiseStores(store: Store<any>): void {
  ChatItemStore = getModule(ChatItems, store)
  DeviceStore = getModule(Device, store)
}

export { initialiseStores, ChatItemStore, DeviceStore }
