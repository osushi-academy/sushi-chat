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
        :icons="icons"
        @click-icon="clickIcon"
        @hide-modal="hide"
      />
      <SettingPage
        v-if="isDrawer && isAdmin"
        :room-id="room.id"
        :title="''"
        :topics="topics"
        :topic-states="topicStates"
        @change-topic-state="changeTopicState"
      />
      <div v-for="(chatData, index) in chatDataList" :key="index">
        <ChatRoom
          :topic-index="index"
          :chat-data="chatData"
          :favorite-callback-register="favoriteCallbackRegister"
          :topic-state="topicStates[chatData.topic.id]"
          @send-stamp="sendFavorite"
          @topic-activate="changeActiveTopic"
        />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VModal from 'vue-js-modal'
import { Room, ChatItem, Topic, TopicState, Stamp } from '@/models/contents'
import { AdminBuildRoomResponse } from '@/models/event'
import ChatRoom from '@/components/ChatRoom.vue'
import CreateRoomModal from '@/components/CreateRoomModal.vue'
import SelectIconModal from '@/components/SelectIconModal.vue'
import socket from '~/utils/socketIO'
import { ChatItemStore, DeviceStore, UserItemStore } from '~/store'

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
  topics: Topic[]
  activeUserCount: number
  topicStates: { [key: string]: TopicState }
  room: Room
  isRoomStarted: boolean
  // ユーザー関連
  icons: any
}
Vue.use(VModal)
export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
    SelectIconModal,
    CreateRoomModal,
  },
  data(): DataType {
    return {
      // 管理画面
      hamburgerMenu: 'menu',
      isDrawer: false,
      // ルーム情報
      topics: [],
      activeUserCount: 0,
      topicStates: {},
      room: {} as Room,
      isRoomStarted: false,
      // ユーザー関連
      icons: [
        { url: require('@/assets/img/sushi_akami.png') },
        { url: require('@/assets/img/sushi_ebi.png') },
        { url: require('@/assets/img/sushi_harasu.png') },
        { url: require('@/assets/img/sushi_ikura.png') },
        { url: require('@/assets/img/sushi_iwashi.png') },
        { url: require('@/assets/img/sushi_kai_hokkigai.png') },
        { url: require('@/assets/img/sushi_salmon.png') },
        { url: require('@/assets/img/sushi_shirasu.png') },
        { url: require('@/assets/img/sushi_tai.png') },
        { url: require('@/assets/img/sushi_uni.png') },
        { url: require('@/assets/img/sushi_syari.png') },
      ],
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
  },
  created(): any {
    if (this.$route.query.user === 'admin') {
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
        'ADMIN_ENTER_ROOM',
        {
          roomId: this.$route.query.roomId,
        },
        ({ chatItems, topics, activeUserCount }: any) => {
          topics.forEach(({ id, state }: any) => {
            this.topicStates[id] = state
          })
          ChatItemStore.addList(chatItems)
          this.topics = topics
          this.activeUserCount = activeUserCount
          this.isRoomStarted = true // TODO: API側の対応が必要
        },
      )
    } else {
      this.$modal.show('sushi-modal')
    }
    // SocketIOのコールバックの登録
    socket.on('PUB_CHAT_ITEM', (chatItem: ChatItem) => {
      // 自分が送信したChatItemであればupdate、他のユーザーが送信したchatItemであればaddを行う
      ChatItemStore.addOrUpdate(chatItem)
    })
    socket.on('PUB_CHANGE_TOPIC_STATE', (res: any) => {
      if (res.type === 'OPEN') {
        // 現在activeなトピックがあればfinishedにする
        this.topicStates = Object.fromEntries(
          Object.entries(this.topicStates).map(([topicId, topicState]) => [
            topicId,
            topicState === 'active' ? 'finished' : topicState,
          ])
        )
        this.topicStates[res.topicId] = 'active'
      } else if (res.type === 'PAUSE') {
        this.topicStates[res.topicId] = 'paused'
      } else if (res.type === 'CLOSE') {
        this.topicStates[res.topicId] = 'finished'
      }
    })
    DeviceStore.determineOs()
  },
  methods: {
    // 管理画面の開閉
    clickDrawerMenu() {
      this.isDrawer = !this.isDrawer
      if (this.isDrawer) {
        this.hamburgerMenu = 'close'
      } else {
        this.hamburgerMenu = 'menu'
      }
    },
    changeTopicState(topicId: string, state: TopicState) {
      if (state === 'not-started') {
        return
      }
      this.topicStates[topicId] = state
      const socket = (this as any).socket
      socket.emit('ADMIN_CHANGE_TOPIC_STATE', {
        roomId: this.room.id,
        type:
          state === 'active' ? 'OPEN' : state === 'paused' ? 'PAUSE' : 'CLOSE',
        topicId,
      })
    },
    // ルーム情報
    // topic反映
    startChat(room: Room, topicsAdmin: Omit<Topic, 'id'>[]) {
      this.room = room
      let alertmessage = ''
      // ルーム名絶対入れないとだめ
      if (this.room.title === '') {
        alertmessage = 'ルーム名を入力してください\n'
      }

      // 仮topicから空でないものをtopicsに
      const topics: Omit<Topic, 'id'>[] = []
      for (const t in topicsAdmin) {
        if (topicsAdmin[t].title) {
          topics.push(topicsAdmin[t])
          // this.topicStates[this.topicsAdmin[t].id] = 'not-started'
        }
      }

      // トピック0はだめ
      if (topics.length === 0) {
        alertmessage += 'トピック名を入力してください\n'
      }

      // ルーム名かトピック名が空ならアラート出して終了
      if (alertmessage !== '') {
        alert(alertmessage)
        return
      }

      // ルームを作成
      const socket = (this as any).socket
      socket.emit(
        'ADMIN_BUILD_ROOM',
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
            'ADMIN_ENTER_ROOM',
            {
              roomId: room.id,
            },
            ({ chatItems, topics, activeUserCount }: any) => {
              topics.forEach(({ id, state }: any) => {
                this.topicStates[id] = state
              })
              ChatItemStore.addList(chatItems)
              this.topics = topics
              this.activeUserCount = activeUserCount
            }
          )
        }
      )

      // ルーム開始
      this.$modal.hide('sushi-modal')
    },

    startRoom() {
      const socket = (this as any).socket
      socket.emit('ADMIN_START_ROOM', { roomId: this.room.id })
      this.isRoomStarted = true
    },

    // アクティブトピックが変わる
    changeActiveTopic(topicId: string) {
      const socket = (this as any).socket
      socket.emit('ADMIN_CHANGE_TOPIC_STATE', {
        roomId: this.room.id,
        topicId,
        type: 'OPEN',
      })
    },

    // ユーザ関連
    // modalを消し、topic作成
    hide(): any {
      this.$modal.hide('sushi-modal')
      this.enterRoom(UserItemStore.userItems.myIconId + 1)
    },
    // ルーム入室
    enterRoom(iconId: number) {
      const socket = (this as any).socket

      const roomId = this.$route.query.roomId as string
      socket.emit(
        'ENTER_ROOM',
        {
          iconId,
          roomId,
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (res: any) => {
          this.topics = res.topics
          ChatItemStore.addList(res.chatItems)
          res.topics.forEach((topic: any) => {
            this.topicStates[topic.id] = topic.state
          })
        }
      )
    },
    // アイコン選択
    clickIcon(index: number) {
      UserItemStore.changeMyIcon(index)
    },

    sendFavorite(topicId: string) {
      const socket = (this as any).socket
      socket.emit('POST_STAMP', { topicId })
    },
    // スタンプが通知された時に実行されるコールバックの登録
    // NOTE: スタンプ周りのUI表示が複雑なため、少しややこしい実装を採用しています。
    favoriteCallbackRegister(
      topicId: string,
      callback: (count: number) => void
    ) {
      const socket = (this as any).socket
      socket.on('PUB_STAMP', (stamps: Stamp[]) => {
        const stampsAboutTopicId = stamps.filter(
          // スタンプは自分が押したものも通知されるため省く処理を入れています
          (stamp) => stamp.topicId === topicId && stamp.userId !== socket.id
        )
        if (stampsAboutTopicId.length > 0) {
          callback(stampsAboutTopicId.length)
        }
      })
    },
  },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TOPICS = [
  {
    id: '1',
    title: 'TITLE 0',
    urls: {},
  },
  {
    id: '2',
    title: 'TITLE 0',
    urls: {},
  },
  {
    id: '3',
    title: 'TITLE 0',
    urls: {},
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CHAT_DUMMY_DATA: ChatItem[] = [
  {
    timestamp: 60,
    iconId: '2',
    createdAt: new Date('2021-05-08T00:00:00.000Z'),
    id: '001',
    topicId: '1',
    type: 'message',
    content: 'コメント',
    target: null,
  },
  {
    timestamp: 0,
    iconId: '3',
    createdAt: new Date('2021-05-08T00:00:00.000Z'),
    target: {
      id: '001',
      topicId: '0',
      type: 'message',
      iconId: '2',
      timestamp: 0,
      createdAt: new Date('2021-05-08T00:00:00.000Z'),
      content: 'コメント',
      target: null,
    },
    id: '002',
    topicId: '1',
    type: 'reaction',
  },
  {
    timestamp: 0,
    iconId: '2',
    createdAt: new Date('2021-05-08T00:00:00.000Z'),
    id: '003',
    topicId: '1',
    type: 'question',
    content: '質問',
  },
  {
    timestamp: 0,
    iconId: '3',
    createdAt: new Date('2021-05-08T00:00:00.000Z'),
    id: '004',
    topicId: '1',
    type: 'answer',
    content: '回答',
    target: {
      id: '003',
      topicId: '0',
      type: 'question',
      iconId: '2',
      timestamp: 0,
      createdAt: new Date('2021-05-08T00:00:00.000Z'),
      content: '質問',
    },
  },
  {
    timestamp: 0,
    iconId: '4',
    createdAt: new Date('2021-05-08T00:00:00.000Z'),
    target: {
      id: '001',
      topicId: '0',
      type: 'message',
      iconId: '2',
      timestamp: 0,
      createdAt: new Date('2021-05-08T00:00:00.000Z'),
      content: 'コメント',
      target: null,
    },
    id: '005',
    topicId: '1',
    type: 'message',
    content: 'リプライ',
  },
]
</script>
