/* eslint-disable import/no-mutable-exports */
import { Store } from "vuex"
import { getModule } from "vuex-module-decorators"
import ChatItems from "~/store/chatItems"
import Device from "~/store/device"
import UserItems from "~/store/userItems"
import Stamps from "~/store/stamps"

let ChatItemStore: ChatItems
let DeviceStore: Device
let UserItemStore: UserItems
let StampStore: Stamps
function initialiseStores(store: Store<any>): void {
  ChatItemStore = getModule(ChatItems, store)
  DeviceStore = getModule(Device, store)
  UserItemStore = getModule(UserItems, store)
  StampStore = getModule(Stamps, store)
}

export { initialiseStores, ChatItemStore, DeviceStore, UserItemStore, StampStore }
