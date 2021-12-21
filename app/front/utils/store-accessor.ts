/* eslint-disable import/no-mutable-exports */
import { Store } from "vuex"
import { getModule } from "vuex-module-decorators"
import ChatItems from "~/store/chatItems"
import Device from "~/store/device"
import UserItems from "~/store/userItems"
import SelectedTopicId from "~/store/selectedTopicId"
import ShowSidebar from "~/store/showSidebar"
import Stamps from "~/store/stamps"
import Topics from "~/store/topics"
import TopicStateItems from "~/store/topicStateItems"
import Auth from "~/store/auth"
import PinnedChatItems from "~/store/pinnedChatItems"
import Room from "~/store/room"

let ChatItemStore: ChatItems
let DeviceStore: Device
let UserItemStore: UserItems
let SelectedTopicStore: SelectedTopicId
let SidebarStore: ShowSidebar
let StampStore: Stamps
let TopicStore: Topics
let TopicStateItemStore: TopicStateItems
let AuthStore: Auth
let PinnedChatItemsStore: PinnedChatItems
let RoomStore: Room

function initialiseStores(store: Store<any>): void {
  ChatItemStore = getModule(ChatItems, store)
  DeviceStore = getModule(Device, store)
  UserItemStore = getModule(UserItems, store)
  SelectedTopicStore = getModule(SelectedTopicId, store)
  SidebarStore = getModule(ShowSidebar, store)
  StampStore = getModule(Stamps, store)
  TopicStore = getModule(Topics, store)
  TopicStateItemStore = getModule(TopicStateItems, store)
  AuthStore = getModule(Auth, store)
  PinnedChatItemsStore = getModule(PinnedChatItems,store)
  RoomStore = getModule(Room, store)
}

export {
  initialiseStores,
  ChatItemStore,
  DeviceStore,
  UserItemStore,
  SelectedTopicStore,
  SidebarStore,
  StampStore, 
  TopicStore,
  TopicStateItemStore,
  AuthStore,
  PinnedChatItemsStore,
  RoomStore
}
