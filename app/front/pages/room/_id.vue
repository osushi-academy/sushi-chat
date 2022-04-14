<template>
  <div class="container page">
    <main>
      <SelectIconModal
        v-if="loadingFinished && isRoomStarted && !isAdmin && !isRoomEnter"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <NotStarted
        v-if="loadingFinished && !isRoomStarted && !isAdmin"
        @check-status-and-action="checkStatusAndAction"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <AdminTool
        v-if="showAdminTool"
        @start-room="startRoom"
        @change-topic-state="changeTopicState"
        @finish-room="finishRoom"
      />
      <div
        v-if="isRoomEnter"
        class="chat-room-area"
        :class="{ 'show-admin-tool': showAdminTool }"
      >
        <SidebarDrawer />
        <div
          v-if="showSidebar"
          class="chat-room-area__cover"
          @click="closeSidebar"
        />
        <ChatRoom
          :topic-index="selectedTopicId"
          :topic-id="selectedTopicId"
          :topic-state="topicStateItems[selectedTopicId]"
          :disable-interaction="room.state === 'finished'"
        />
      </div>
    </main>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import {
  Topic,
  TopicState,
  RoomModel,
  StampModel,
  PubUserCountParam,
  PubPinnedMessageParam,
  EnterRoomResponse,
} from "sushi-chat-shared"
import AdminTool from "@/components/AdminTool/AdminTool.vue"
import ChatRoom from "@/components/ChatRoom.vue"
import SelectIconModal from "@/components/SelectIconModal.vue"
import SidebarDrawer from "@/components/Sidebar/SidebarDrawer.vue"
import {
  ChatItemStore,
  DeviceStore,
  UserItemStore,
  SelectedTopicStore,
  SidebarStore,
  StampStore,
  TopicStore,
  TopicStateItemStore,
  PinnedChatItemsStore,
  RoomStore,
} from "~/store"

// Data型
type DataType = {
  // ルーム情報
  activeUserCount: number
  isRoomEnter: boolean
}
Vue.use(VModal)
export default Vue.extend({
  name: "Index",
  components: {
    AdminTool,
    ChatRoom,
    SelectIconModal,
    SidebarDrawer,
  },
  data(): DataType {
    return {
      // ルーム情報
      activeUserCount: 0,
      isRoomEnter: false,
    }
  },
  computed: {
    room(): RoomModel {
      return RoomStore.room
    },
    isRoomStarted(): boolean {
      return this.room.state === "ongoing" || this.room.state === "finished"
    },
    isAdmin(): boolean {
      return UserItemStore.userItems.isAdmin
    },
    topics(): Topic[] {
      // 各トピックの情報
      return TopicStore.topics
    },
    topicStateItems() {
      // 各トピックの状態
      return TopicStateItemStore.topicStateItems
    },
    selectedTopicId(): number {
      return SelectedTopicStore.selectedTopicId
    },
    showAdminTool(): boolean {
      return this.isAdmin && this.room.adminInviteKey != null
    },
    loadingFinished(): boolean {
      return Object.keys(this.room).length > 1
    },
    showSidebar(): boolean {
      return SidebarStore.showSidebar
    },
  },
  created() {
    // roomId取得
    RoomStore.setId(this.$route.path.split("/")[2])
    if (this.$route.query.user === "admin") {
      UserItemStore.changeIsAdmin(true)
    }
  },
  mounted() {
    if (typeof this.room.id === "undefined") {
      this.$router.push("/")
    }
    // statusに合わせた操作をする
    this.checkStatusAndAction()
    DeviceStore.determineOs()
  },
  async beforeDestroy() {
    const socket = await this.$socket()
    socket.disconnect()
  },
  methods: {
    async checkStatusAndAction() {
      // ルーム情報取得・status更新
      const res = await this.$apiClient
        .get({
          pathname: "/room/:id",
          params: { id: this.room.id },
        })
        .catch((e) => {
          throw new Error(e)
        })

      if (res.result === "error") {
        throw new Error(res.error.message)
      }
      RoomStore.set(res.data)
      TopicStore.set(res.data.topics)

      if (this.room.state === "ongoing") {
        // 開催中
        if (this.isAdmin) {
          this.adminEnterRoom()
        } else {
          // ユーザーの入室
          this.$modal.show("sushi-modal")
        }
      } else if (this.room.state === "finished") {
        // 終了時。すべてのトピックが閉じたルームのアーカイブが閲覧できる。
        this.isRoomEnter = true
        const history = await this.$apiClient
          .get({
            pathname: "/room/:id/history",
            params: { id: this.room.id },
          })
          .catch((e) => {
            throw new Error(e)
          })
        if (history.result === "error") {
          console.error(history.error)
          return
        }
        // 入室
        ChatItemStore.setChatItems(
          history.data.chatItems.map((chatItem) => ({
            ...chatItem,
            status: "success",
          })),
        )
        history.data.pinnedChatItemIds.forEach((pinnedChatItem) => {
          if (pinnedChatItem) {
            PinnedChatItemsStore.add(pinnedChatItem)
          }
        })
      }
    },
    // socket.ioのセットアップ。配信を受け取る
    async socketSetUp() {
      // socket接続
      this.$initSocket(UserItemStore.userItems.isAdmin)
      const socket = await this.$socket()

      // SocketIOのコールバックの登録
      socket.on("PUB_CHAT_ITEM", (chatItem) => {
        console.log(chatItem)
        // 自分が送信したChatItemであればupdate、他のユーザーが送信したchatItemであればaddを行う
        ChatItemStore.addOrUpdate({ ...chatItem, status: "success" })
      })
      socket.on("PUB_CHANGE_TOPIC_STATE", (res) => {
        // クリックしたTopicのStateを変える
        TopicStateItemStore.change({ key: res.topicId, state: res.state })
      })
      // スタンプ通知時の、SocketIOのコールバックの登録
      socket.on("PUB_STAMP", (stamps: StampModel[]) => {
        stamps.forEach((stamp) => {
          StampStore.addOrUpdate(stamp)
        })
      })
      // アクティブユーザー数のSocketIOのコールバックの登録
      socket.on("PUB_USER_COUNT", (res: PubUserCountParam) => {
        this.activeUserCount = res.activeUserCount
      })
      // ピン留めアイテムのSocketIOのコールバックの登録
      socket.on("PUB_PINNED_MESSAGE", (res: PubPinnedMessageParam) => {
        if (
          PinnedChatItemsStore.pinnedChatItems.find(
            (id) => id === res.chatItemId,
          )
        ) {
          PinnedChatItemsStore.delete(res.chatItemId)
        } else {
          PinnedChatItemsStore.add(res.chatItemId)
        }
      })
    },
    async changeTopicState(topicId: number, state: TopicState) {
      TopicStateItemStore.change({ key: topicId, state })
      const socket = await this.$socket()
      socket.emit(
        "ADMIN_CHANGE_TOPIC_STATE",
        {
          state,
          topicId,
        },
        (res) => {
          console.log(res)
        },
      )
    },
    // ユーザ関連
    // modalを消し、入室
    hide() {
      this.enterRoom(UserItemStore.userItems.myIconId)
    },
    // ルーム入室
    async enterRoom(iconId: number) {
      await this.socketSetUp()
      const socket = await this.$socket()
      socket.emit(
        "ENTER_ROOM",
        {
          iconId,
          roomId: this.room.id,
          speakerTopicId: UserItemStore.userItems.speakerId,
        },
        (res) => {
          this.getRoomInfo(res)
        },
      )
    },
    // 管理者ルーム入室
    async adminEnterRoom() {
      await this.socketSetUp()
      const socket = await this.$socket()
      socket.emit(
        "ADMIN_ENTER_ROOM",
        {
          roomId: this.room.id,
        },
        (res) => {
          this.getRoomInfo(res)
        },
      )
      UserItemStore.changeMyIcon(0)
    },
    // 入室時のルームの情報を取得
    getRoomInfo(res: EnterRoomResponse) {
      if (res.result === "error") {
        console.error(res.error)
        return
      }
      ChatItemStore.setChatItems(
        res.data.chatItems.map((chatItem) => ({
          ...chatItem,
          status: "success",
        })),
      )
      res.data.topicStates.forEach((topicState) => {
        TopicStateItemStore.change({
          key: topicState.topicId,
          state: topicState.state,
        })
      })
      res.data.pinnedChatItemIds.forEach((pinnedChatItem) => {
        if (pinnedChatItem) {
          PinnedChatItemsStore.add(pinnedChatItem)
        }
      })
      this.activeUserCount = res.data.activeUserCount
      this.isRoomEnter = true
    },
    // ルーム終了
    async finishRoom() {
      const socket = await this.$socket()
      socket.emit("ADMIN_FINISH_ROOM", {}, (res) => {
        console.log(res)
      })
      RoomStore.setState("finished")
    },
    // アイコン選択
    clickIcon(index: number) {
      UserItemStore.changeMyIcon(index)
    },
    // RESTでroomの開始
    startRoom() {
      // TODO: ルームの状態をindex、またはvuexでもつ
      this.$apiClient
        .put({
          pathname: "/room/:id/start",
          params: { id: this.room.id },
        })
        .then(() => {
          this.adminEnterRoom()
          RoomStore.setState("ongoing")
        })
        .catch((e) => {
          console.error(e)
          window.alert("ルームを開始できませんでした")
        })
    },
    closeSidebar() {
      SidebarStore.set(false)
    },
  },
})
</script>
