<template>
  <div class="container page">
    <main>
      <SelectIconModal
        v-if="!isAdmin && !isRoomEnter"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <AdminTool
        v-if="isAdmin"
        :room-id="room.id"
        :title="room.title"
        @change-topic-state="changeTopicState"
        @finish-room="finishRoom"
      />
      <template v-if="isRoomEnter">
        <div v-for="(topic, index) in topics" :key="index">
          <ChatRoom
            :topic-index="index"
            :topic-id="`${topic.id}`"
            :topic-state="topicStateItems[topic.id]"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import { Topic, TopicState } from "sushi-chat-shared"
import { Room, ChatItem, Stamp } from "@/models/contents"
import AdminTool from "@/components/AdminTool/AdminTool.vue"
import ChatRoom from "@/components/ChatRoom.vue"
import SelectIconModal from "@/components/SelectIconModal.vue"
import socket from "~/utils/socketIO"
import {
  ChatItemStore,
  DeviceStore,
  UserItemStore,
  StampStore,
  TopicStore,
  TopicStateItemStore,
} from "~/store"

// Data型
type DataType = {
  // 管理画面
  hamburgerMenu: string
  isDrawer: boolean
  // ルーム情報
  activeUserCount: number
  room: Room
  isRoomEnter: boolean
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
      room: {} as Room,
      isRoomEnter: false,
    }
  },
  computed: {
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
  },
  created(): any {
    if (this.$route.query.user === "admin") {
      UserItemStore.changeIsAdmin(true)
    }
  },
  async mounted() {
    // roomId取得
    this.room.id = this.$route.query.roomId as string
    if (this.room.id !== "") {
      // TODO: this.room.idが存在しない→404
    }

    // Topics取得
    const response = await this.$apiClient.get(
      {
        pathname: "/room/:id",
        params: {
          id: this.room.id,
        },
      },
      {},
    )
    if (response.result === "error") {
      throw new Error("エラーが発生しました")
    }
    TopicStore.set(response.data.topics)

    // socket接続
    ;(this as any).socket = socket
    if (this.isAdmin) {
      // 管理者の入室
      socket.emit(
        "ADMIN_ENTER_ROOM",
        {
          roomId: this.room.id,
        },
        (res: any) => {
          ChatItemStore.add(res.data.chatItems)
          res.data.topicStates.forEach((topicState: any) => {
            TopicStateItemStore.change({
              key: `${topicState.topicId}`,
              state: topicState.state,
            })
          })
          this.activeUserCount = res.data.activeUserCount
        },
      )
      this.isRoomEnter = true
    } else {
      // ユーザーの入室
      this.$modal.show("sushi-modal")
    }

    // SocketIOのコールバックの登録
    socket.on("PUB_CHAT_ITEM", (chatItem: ChatItem) => {
      // 自分が送信したChatItemであればupdate、他のユーザーが送信したchatItemであればaddを行う
      ChatItemStore.addOrUpdate(chatItem)
    })
    // TopicStateの変更の配信
    socket.on("PUB_CHANGE_TOPIC_STATE", (res: any) => {
      if (res.type === "OPEN") {
        // 現在ongoingなトピックがあればfinishedにし、setする
        const t = Object.fromEntries(
          Object.entries(this.topicStateItems).map(([topicId, topicState]) => [
            topicId,
            topicState === "ongoing" ? "finished" : topicState,
          ]),
        )
        TopicStateItemStore.set(t)
        // クリックしたTopicのStateを変える
        TopicStateItemStore.change({ key: res.topicId, state: "ongoing" })
      } else if (res.type === "PAUSE") {
        TopicStateItemStore.change({ key: res.topicId, state: "paused" })
      } else if (res.type === "CLOSE") {
        TopicStateItemStore.change({ key: res.topicId, state: "finished" })
      }
    })
    // スタンプ通知時の、SocketIOのコールバックの登録
    socket.on("PUB_STAMP", (stamps: Stamp[]) => {
      stamps.forEach((stamp) => {
        StampStore.add(stamp)
      })
    })
    DeviceStore.determineOs()
  },
  methods: {
    // 管理画面の開閉
    clickDrawerMenu() {
      this.isDrawer = !this.isDrawer
      if (this.isDrawer) {
        this.hamburgerMenu = "close"
      } else {
        this.hamburgerMenu = "menu"
      }
    },
    changeTopicState(topicId: string, state: TopicState) {
      if (state === "not-started") {
        return
      }
      TopicStateItemStore.change({ key: topicId, state })
      const socket = (this as any).socket
      socket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId: this.room.id,
        type:
          state === "ongoing" ? "OPEN" : state === "paused" ? "PAUSE" : "CLOSE",
        topicId,
      })
    },

    // ユーザ関連
    // modalを消し、入室
    hide(): any {
      this.enterRoom(UserItemStore.userItems.myIconId)
      this.isRoomEnter = true
    },
    // ルーム入室
    enterRoom(iconId: number) {
      const socket = (this as any).socket
      socket.emit(
        "ENTER_ROOM",
        {
          iconId,
          roomId: this.room.id,
          speakerTopicId: null, // TODO: speakerTopicIdを渡す
        },
        (res: any) => {
          res.data.topicStates.forEach((topicState: any) => {
            TopicStateItemStore.change({
              key: `${topicState.topicId}`,
              state: topicState.state,
            })
          })
          ChatItemStore.add(res.data.chatItems)
        },
      )
    },
    // ルーム終了
    finishRoom() {
      const socket = (this as any).socket
      socket.emit("ADMIN_FINISH_ROOM")
    },
    // アイコン選択
    clickIcon(index: number) {
      UserItemStore.changeMyIcon(index - 1)
    },
  },
})
</script>
