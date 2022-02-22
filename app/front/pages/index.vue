<template>
  <div class="container page">
    <main>
      <SelectIconModal
        v-if="loadingFinished && isRoomStarted && !isAdmin && !isRoomEnter"
        :title="room.title"
        :description="room.description"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <NotStarted
        v-if="loadingFinished && !isRoomStarted && !isAdmin"
        :title="room.title"
        :description="room.description"
        @check-status-and-action="checkStatusAndAction"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <AdminTool
        v-if="showAdminTool"
        :room="room"
        :room-id="room.id"
        :title="room.title"
        :room-state="roomState"
        :admin-invite-key="room.adminInviteKey"
        @start-room="startRoom"
        @change-topic-state="changeTopicState"
        @finish-room="finishRoom"
      />
      <div
        v-if="isRoomEnter"
        class="chat-room-area"
        :class="{ 'show-admin-tool': showAdminTool }"
      >
        <div v-for="(topic, index) in topics" :key="index">
          <ChatRoom
            :topic-index="index"
            :topic-id="topic.id"
            :topic-state="topicStateItems[topic.id]"
          />
        </div>
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
  RoomState,
  StampModel,
  PubUserCountParam,
  PubPinnedMessageParam,
  EnterRoomResponse,
} from "sushi-chat-shared"
import AdminTool from "@/components/AdminTool/AdminTool.vue"
import ChatRoom from "@/components/ChatRoom.vue"
import SelectIconModal from "@/components/SelectIconModal.vue"
import {
  ChatItemStore,
  DeviceStore,
  UserItemStore,
  StampStore,
  TopicStore,
  TopicStateItemStore,
  PinnedChatItemsStore,
} from "~/store"

// Data型
type DataType = {
  // 管理画面
  hamburgerMenu: string
  isDrawer: boolean
  // ルーム情報
  activeUserCount: number
  room: RoomModel
  isRoomEnter: boolean
  roomState: RoomState
}
Vue.use(VModal)
export default Vue.extend({
  name: "Index",
  components: {
    AdminTool,
    ChatRoom,
    SelectIconModal,
  },
  data(): DataType {
    return {
      // 管理画面
      hamburgerMenu: "menu",
      isDrawer: false,
      // ルーム情報
      activeUserCount: 0,
      room: {} as RoomModel,
      isRoomEnter: false,
      roomState: "not-started",
    }
  },
  computed: {
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
    showAdminTool(): boolean {
      return this.isAdmin && this.room.adminInviteKey != null
    },
    loadingFinished(): boolean {
      return Object.keys(this.room).length > 1
    },
  },
  created() {
    // roomId取得
    this.room.id = this.$route.query.roomId as string
    if (this.$route.query.user === "admin") {
      UserItemStore.changeIsAdmin(true)
    }
  },
  mounted() {
    if (typeof this.room.id === "undefined") {
      // TODO: this.room.idが存在しない場合、/loginにリダイレクト
      this.$router.push("/login")
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
      this.room = res.data
      this.roomState = res.data.state
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
        this.isRoomEnter = true
      }
    },
    // socket.ioのセットアップ。配信を受け取る
    async socketSetUp() {
      // socket接続
      this.$initSocket(UserItemStore.userItems.isAdmin)
      const socket = await this.$socket()

      // SocketIOのコールバックの登録
      socket.on("PUB_CHAT_ITEM", (chatItem) => {
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
    // 管理画面の開閉
    clickDrawerMenu() {
      this.isDrawer = !this.isDrawer
      if (this.isDrawer) {
        this.hamburgerMenu = "close"
      } else {
        this.hamburgerMenu = "menu"
      }
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
        () => {
          // do nothing
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
      StampStore.setStamps(res.data.stamps)
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
      socket.emit("ADMIN_FINISH_ROOM", {}, () => {
        // do nothing
      })
      this.roomState = "finished"
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
          this.roomState = "ongoing"
        })
        .catch((e) => {
          console.error(e)
          window.alert("ルームを開始できませんでした")
        })
    },
  },
})
</script>
