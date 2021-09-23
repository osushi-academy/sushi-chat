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
        :title="'技育CAMPハッカソン vol.5'"
        @change-topic-state="changeTopicState"
        @finish-room="finishRoom"
      />
      <div v-for="(topic, index) in topics" :key="index">
        <ChatRoom :topic-index="index" :topic-id="`${topic.id}`" />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import { Topic } from "sushi-chat-shared"
import { Room, ChatItem, Stamp, TopicState } from "@/models/contents"
import { AdminBuildRoomResponse } from "@/models/event"
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
    const res = await this.$apiClient.get(
      {
        pathname: "/room/:id",
        params: {
          id: this.room.id,
        },
      },
      {},
    )
    if (res.result === "error") {
      throw new Error("エラーが発生しました")
    }
    TopicStore.set(res.data.topics)
    // socket接続
    ;(this as any).socket = socket
    if (this.isAdmin && this.room.id != null) {
      // 管理者の入室
      socket.emit(
        "ADMIN_ENTER_ROOM",
        {
          roomId: this.room.id,
        },
        (res: any) => {
          ChatItemStore.add(res.data.chatItems)
          TopicStateItemStore.set(res.data.topicStates)
          this.activeUserCount = res.data.activeUserCount
        },
      )
    } else {
      // ユーザーの入室
      this.$modal.show("sushi-modal")
    }
    // SocketIOのコールバックの登録
    socket.on("PUB_CHAT_ITEM", (chatItem: ChatItem) => {
      // 自分が送信したChatItemであればupdate、他のユーザーが送信したchatItemであればaddを行う
      ChatItemStore.addOrUpdate(chatItem)
    })
    socket.on("PUB_CHANGE_TOPIC_STATE", (res: any) => {
      if (res.type === "OPEN") {
        // 現在activeなトピックがあればfinishedにする
        const t = Object.fromEntries(
          Object.entries(this.topicStateItems).map(([topicId, topicState]) => [
            topicId,
            topicState === "active" ? "finished" : topicState,
          ]),
        )
        TopicStateItemStore.set(t)
        // クリックしたTopicのStateを変える
        TopicStateItemStore.change({ key: res.topicId, state: "active" })
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
          state === "active" ? "OPEN" : state === "paused" ? "PAUSE" : "CLOSE",
        topicId,
      })
    },
    // ルーム情報
    // topic反映
    startChat(room: Room, topicsAdmin: Omit<Topic, "id">[]) {
      this.room = room
      let alertmessage = ""
      // ルーム名絶対入れないとだめ
      if (this.room.title === "") {
        alertmessage = "ルーム名を入力してください\n"
      }

      // 仮topicから空でないものをtopicsに
      const topics: Omit<Topic, "id">[] = []
      for (const t in topicsAdmin) {
        if (topicsAdmin[t].title) {
          topics.push(topicsAdmin[t])
        }
      }

      // トピック0はだめ
      if (topics.length === 0) {
        alertmessage += "トピック名を入力してください\n"
      }

      // ルーム名かトピック名が空ならアラート出して終了
      if (alertmessage !== "") {
        alert(alertmessage)
        return
      }

      // ルームを作成
      const socket = (this as any).socket
      socket.emit(
        "ADMIN_BUILD_ROOM",
        {
          title: this.room.title,
          topics,
        },
        (room: AdminBuildRoomResponse) => {
          this.room = room
          this.$router.push({
            path: this.$router.currentRoute.path,
            query: { ...this.$router.currentRoute.query, roomId: room.id },
          })
          socket.emit(
            "ADMIN_ENTER_ROOM",
            {
              roomId: room.id,
            },
            (res: any) => {
              ChatItemStore.add(res.data.chatItems)
              TopicStateItemStore.set(res.data.topicStates)
              this.activeUserCount = res.data.activeUserCount
            },
          )
        },
      )
      // ルーム開始
      this.$modal.hide("sushi-modal")
    },

    // ユーザ関連
    // modalを消し、topic作成
    hide(): any {
      this.isRoomEnter = true
      this.enterRoom(UserItemStore.userItems.myIconId)
    },
    // ルーム入室
    enterRoom(iconId: number) {
      const socket = (this as any).socket
      socket.emit(
        "ENTER_ROOM",
        {
          iconId,
          roomId: this.room.id,
          speakerTopicId: 1, // TODO: speakerTopicIdを渡す
        },
        (res: any) => {
          ChatItemStore.add(res.data.chatItems)
          TopicStateItemStore.set(res.data.topicStates)
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
      UserItemStore.changeMyIcon(index)
    },
  },
})
</script>
