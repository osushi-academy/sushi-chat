/* eslint-disable import/no-mutable-exports */
import { Store } from "vuex"
import { getModule } from "vuex-module-decorators"
import ChatItems from "~/store/chatItems"
import Device from "~/store/device"
import UserItems from "~/store/userItems"
import Topics from "~/store/topics"

let ChatItemStore: ChatItems
let DeviceStore: Device
let UserItemStore: UserItems
let TopicStore: Topics
function initialiseStores(store: Store<any>): void {
  ChatItemStore = getModule(ChatItems, store)
  DeviceStore = getModule(Device, store)
  UserItemStore = getModule(UserItems, store)
  TopicStore = getModule(Topics, store)
}

export { initialiseStores, ChatItemStore, DeviceStore, UserItemStore, TopicStore }
