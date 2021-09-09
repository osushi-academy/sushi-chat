<template>
  <div class="container page">
    <header v-if="isAdmin">
      <button @click="clickDrawerMenu">
        <span class="material-icons"> {{ hamburgerMenu }} </span>
      </button>
      <button v-if="!isRoomStarted" @click="startRoom">
        ルームをオープンする
      </button>
    </header>
    <main>
      <CreateRoomModal
        v-if="isAdmin && room.id == null"
        @start-chat="startChat"
      />
      <SelectIconModal
        v-if="!isAdmin"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <SettingPage
        v-if="isDrawer && isAdmin"
        :room-id="room.id"
        :title="''"
        @change-topic-state="changeTopicState"
      />
      <div v-for="(chatData, index) in chatDataList" :key="index">
        <ChatRoom
          :topic-index="index"
          :chat-data="chatData"
          :favorite-callback-register="favoriteCallbackRegister"
          @send-stamp="sendFavorite"
          @topic-activate="changeActiveTopic"
        />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import { Room, ChatItem, Topic, TopicState, Stamp } from "@/models/contents"
import { AdminBuildRoomResponse } from "@/models/event"
import ChatRoom from "@/components/ChatRoom.vue"
import CreateRoomModal from "@/components/CreateRoomModal.vue"
import SelectIconModal from "@/components/SelectIconModal.vue"
import socket from "~/utils/socketIO"
import {
  ChatItemStore,
  DeviceStore,
  UserItemStore,
  TopicStore,
  TopicStateItemStore,
} from "~/store"

// 1つのトピックと、そのトピックに関するメッセージ一覧を含むデータ構造
type ChatData = {
  topic: Topic
}

// Data型
type DataType = {
  // 管理画面
  hamburgerMenu: string
  isDrawer: boolean
  // ルーム情報
  activeUserCount: number
  room: Room
  isRoomStarted: boolean
}
Vue.use(VModal)
export default Vue.extend({
  name: "Index",
  components: {
    ChatRoom,
    SelectIconModal,
    CreateRoomModal,
  },
  // async asyncData({ app }) {
  //   const sampleResponse = await app.$apiClient.get(
  //     { pathname: "/room/:id/history", params: { id: "roomId" } },
  //     {},
  //   )
  //   if (sampleResponse.result === "success") {
  //     const rooms = sampleResponse.data
  //     console.log(rooms)
  //     return { rooms }
  //   } else {
  //     // NOTE: エラーハンドリングどうやるのがベストかわかってない....
  //     throw new Error("データの取得に失敗しました")
  //   }
  // },
  data(): DataType {
    return {
      // 管理画面
      hamburgerMenu: "menu",
      isDrawer: false,
      // ルーム情報
      activeUserCount: 0,
      room: {} as Room,
      isRoomStarted: false,
    }
  },
  computed: {
    chatDataList(): ChatData[] {
      return this.topics.map((topic) => ({
        topic,
      }))
    },
    isAdmin(): boolean {
      return UserItemStore.userItems.isAdmin
    },
    topics(): Topic[] {
      return TopicStore.topics
    },
    topicStateItems() {
      return TopicStateItemStore.topicStateItems
    },
  },
  created(): any {
    if (this.$route.query.user === "admin") {
      UserItemStore.changeIsAdmin(true)
    }
  },
  mounted(): any {
    if (this.$route.query.roomId != null) {
      // TODO: redirect
    }
    ;(this as any).socket = socket
    if (this.isAdmin && this.$route.query.roomId != null) {
      socket.emit(
        "ADMIN_ENTER_ROOM",
        {
          roomId: this.$route.query.roomId,
        },
        ({ chatItems, topics, activeUserCount }: any) => {
          topics.forEach(({ id, state }: any) => {
            this.topicStateItems[id] = state
          })
          ChatItemStore.addList(chatItems)
          TopicStore.set(topics)
          this.activeUserCount = activeUserCount
          this.isRoomStarted = true // TODO: API側の対応が必要
        },
      )
    } else {
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
          console.log(`ルームID: ${room.id}`)
          this.$router.push({
            path: this.$router.currentRoute.path,
            query: { ...this.$router.currentRoute.query, roomId: room.id },
          })
          socket.emit(
            "ADMIN_ENTER_ROOM",
            {
              roomId: room.id,
            },
            ({ chatItems, topics, activeUserCount }: any) => {
              topics.forEach(({ id, state }: any) => {
                TopicStateItemStore.change({ key: id, state })
              })
              ChatItemStore.addList(chatItems)
              TopicStore.set(topics)
              this.activeUserCount = activeUserCount
            },
          )
        },
      )

      // ルーム開始
      this.$modal.hide("sushi-modal")
    },

    startRoom() {
      const socket = (this as any).socket
      socket.emit("ADMIN_START_ROOM", { roomId: this.room.id })
      this.isRoomStarted = true
    },

    // アクティブトピックが変わる
    changeActiveTopic(topicId: string) {
      const socket = (this as any).socket
      socket.emit("ADMIN_CHANGE_TOPIC_STATE", {
        roomId: this.room.id,
        topicId,
        type: "OPEN",
      })
    },

    // ユーザ関連
    // modalを消し、topic作成
    hide(): any {
      this.$modal.hide("sushi-modal")
      this.enterRoom(UserItemStore.userItems.myIconId)
    },
    // ルーム入室
    enterRoom(iconId: number) {
      const socket = (this as any).socket

      const roomId = this.$route.query.roomId as string
      socket.emit(
        "ENTER_ROOM",
        {
          iconId,
          roomId,
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (res: any) => {
          TopicStore.set(res.topics)
          ChatItemStore.addList(res.chatItems)
          res.topics.forEach((topic: any) => {
            TopicStateItemStore.change({ key: topic.id, state: topic.state })
          })
        },
      )
    },
    // アイコン選択
    clickIcon(index: number) {
      UserItemStore.changeMyIcon(index)
    },

    sendFavorite(topicId: string) {
      const socket = (this as any).socket
      socket.emit("POST_STAMP", { topicId })
    },
    // スタンプが通知された時に実行されるコールバックの登録
    // NOTE: スタンプ周りのUI表示が複雑なため、少しややこしい実装を採用しています。
    favoriteCallbackRegister(
      topicId: string,
      callback: (count: number) => void,
    ) {
      const socket = (this as any).socket
      socket.on("PUB_STAMP", (stamps: Stamp[]) => {
        const stampsAboutTopicId = stamps.filter(
          // スタンプは自分が押したものも通知されるため省く処理を入れています
          (stamp) => stamp.topicId === topicId && stamp.userId !== socket.id,
        )
        if (stampsAboutTopicId.length > 0) {
          callback(stampsAboutTopicId.length)
        }
      })
    },
  },
})
</script>
