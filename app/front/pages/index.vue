<template>
  <div class="container page">
    <header>
      <button @click="clickDrawerMenu">
        <span class="material-icons"> {{ hamburgerMenu }} </span>
      </button>
    </header>
    <main>
      <modal
        v-if="isAdmin"
        name="sushi-modal"
        :adaptive="true"
        :click-to-close="false"
      >
        <div class="modal-header">
          <h2>ルーム作成</h2>
        </div>
        <div class="modal-body modal-scrollable">
          <h3>ルーム名</h3>
          <input v-model="roomName" />
          <h3>トピック名</h3>
          <div>
            <div v-for="(topic, index) in topicsAdmin" :key="topic.id">
              <h3 class="modal-index">{{ index + 1 }}</h3>
              <input
                v-model="topicsAdmin[index].title"
                :tabindex="index"
                name="titleArea"
                class="secondary-textarea text-input"
                contenteditable
                placeholder="トピック名"
                @keydown.enter.exact="clickAddTopic"
              />
              <button
                type="button"
                class="secondary-button topic-remove"
                @click="removeTopic(index)"
              >
                削除
              </button>
            </div>
            <textarea v-model="inputText"></textarea>
            <button
              type="button"
              class="secondary-button topic-add"
              @click="addTopic"
            >
              追加
            </button>
            <button
              type="button"
              class="secondary-button topic-start"
              @click="startChat"
            >
              はじめる
            </button>
          </div>
        </div>
      </modal>
      <modal
        v-if="!isAdmin"
        name="sushi-modal"
        :adaptive="true"
        :click-to-close="false"
      >
        <div class="modal-header">
          <h2>アイコンを選んでね</h2>
        </div>
        <div class="modal-body">
          <div class="icon-list">
            <button
              v-for="(icon, index) in icons"
              :key="index"
              :class="{
                'icon-selected': iconChecked == index,
                'icon-shari': index === 10,
              }"
              class="icon-box"
              @click="clickIcon(index)"
            >
              <img :src="icon.url" alt="" class="sushi-fit" />
            </button>
          </div>
          <div class="modal-actions">
            <button
              :disabled="iconChecked < 0"
              type="button"
              class="primary-button"
              @click="hide"
            >
              はじめる
            </button>
          </div>
        </div>
      </modal>
      <SettingPage v-if="isDrawer" />
      <div v-for="(chatData, index) in chatDataList" :key="index">
        <ChatRoom
          :topic-index="index"
          :is-admin="isAdmin"
          :chat-data="chatData"
          :favorite-callback-register="favoriteCallbackRegister"
          :my-icon="iconChecked"
          :is-active-topic="activeTopicId == chatData.topic.id"
          :is-finished-topic="
            topics.findIndex(({ id }) => id === chatData.topic.id) <
            topics.findIndex(({ id }) => id === activeTopicId)
          "
          @send-message="sendMessage"
          @send-reaction="sendReaction"
          @send-stamp="sendFavorite"
          @topic-activate="changeActiveTopic"
        />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import VModal from 'vue-js-modal'
import { ChatItem, Message, Topic, Stamp } from '@/models/contents'
import {
  PostChatItemMessageParams,
  PostChatItemReactionParams,
} from '@/models/event'
import SettingPage from '@/components/SettingPage.vue'
import ChatRoom from '@/components/ChatRoom.vue'
import { io } from 'socket.io-client'
import getUUID from '@/utils/getUUID'
import { getSelectedIcon, setSelectedIcon } from '@/utils/reserveSelectIcon'

// 1つのトピックと、そのトピックに関するメッセージ一覧を含むデータ構造
type ChatData = {
  topic: Topic
  message: ChatItem[]
}

// Data型
type DataType = {
  activeUserCount: number
  topics: Topic[]
  topicsAdmin: Topic[]
  messages: ChatItem[]
  isAdmin: boolean
  icons: any
  iconChecked: number
  activeTopicId: string | null
  roomName: string
  inputText: string
  isDrawer: boolean
  hamburgerMenu: string
}
Vue.use(VModal)
export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
    SettingPage,
  },
  data(): DataType {
    return {
      roomName: '',
      inputText: '',
      topics: [],
      topicsAdmin: [],
      messages: [],
      activeUserCount: 0,
      isAdmin: false,
      isDrawer: false,
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
      iconChecked: -1,
      activeTopicId: null,
      hamburgerMenu: 'menu',
    }
  },
  computed: {
    chatDataList(): ChatData[] {
      return this.topics.map((topic) => ({
        topic,
        message: this.messages.filter(({ topicId }) => topicId === topic.id),
      }))
    },
  },
  mounted(): any {
    if (this.$route.query.user === 'admin') {
      this.isAdmin = true
    }

    const socket = io(process.env.apiBaseUrl as string)
    ;(this as any).socket = socket

    if (!this.isAdmin) {
      const selectedIcon = getSelectedIcon()
      if (selectedIcon == null) {
        this.$modal.show('sushi-modal')
      } else {
        this.iconChecked = selectedIcon - 1
        this.enterRoom(selectedIcon)
      }
    }
    this.$modal.show('sushi-modal')

    socket.on('PUB_CHAT_ITEM', (res: any) => {
      if (!this.messages.find((message) => message.id === res.content.id)) {
        this.messages.push(res.content)
      }
    })

    socket.on('PUB_CHANGE_ACTIVE_TOPIC', (res: any) => {
      this.activeTopicId = `${res.topicId}`
    })

    socket.on('PUB_FINISH_TOPIC', (res: any) => {
      const messageAdmin: Message = {
        id: `${getUUID()}`,
        topicId: res.topicId,
        type: 'message',
        iconId: '0',
        timestamp: 0,
        content: '【運営Bot】\n 以下、質問一覧です！',
        isQuestion: false,
      }
      this.messages.push(messageAdmin)
      for (const i in this.messages) {
        // 閉じたトピックのmessageについて
        if (
          this.messages[i].topicId === res.topicId &&
          this.messages[i].type === 'message'
        ) {
          // @ts-ignore
          if (this.messages[i].isQuestion) {
            const m: Message = {
              id: `${getUUID()}`,
              topicId: res.topicId,
              type: 'message',
              iconId: '0',
              timestamp: 0,
              // @ts-ignore
              content: this.messages[i].content,
              isQuestion: true,
            }
            this.messages.push(m)
          }
        }
      }
    })
  },
  methods: {
    sendMessage(text: string, topicId: string, isQuestion: boolean) {
      const socket = (this as any).socket
      const params: PostChatItemMessageParams = {
        type: 'message',
        id: getUUID(),
        topicId,
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        content: text,
        isQuestion,
      }
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', params)
      // ローカルに反映する
      this.messages.push({
        id: params.id,
        topicId,
        type: 'message',
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        content: text,
        timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
        isQuestion,
      })
    },
    sendReaction(message: Message) {
      const socket = (this as any).socket
      const params: PostChatItemReactionParams = {
        id: `${getUUID()}`,
        topicId: message.topicId,
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        type: 'reaction',
        reactionToId: message.id,
      }
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', params)
      // ローカルに反映する
      this.messages.push({
        id: params.id,
        topicId: message.topicId,
        type: 'reaction',
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
        target: {
          id: message.id,
          content:
            (this.messages.find(({ id }) => id === message.id) as Message)
              ?.content ?? '',
        },
      })
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
    changeActiveTopic(topicId: string) {
      const socket = (this as any).socket
      socket.emit('CHANGE_ACTIVE_TOPIC', { topicId })
    },
    // modalを消し、topic作成
    hide(): any {
      this.topics.push()
      this.$modal.hide('sushi-modal')
      this.enterRoom(this.iconChecked + 1)
    },
    enterRoom(iconId: number) {
      const socket = (this as any).socket
      socket.emit(
        'ENTER_ROOM',
        {
          iconId,
        },
        (res: any) => {
          this.topics = res.topics
          this.messages = res.chatItems ?? []
          this.activeTopicId = res.activeTopicId
        }
      )
      setSelectedIcon(iconId)
    },
    // 該当するtopicを削除
    removeTopic(index: number) {
      this.topicsAdmin.splice(index, 1)
    },
    // textareaに入力された文字を改行で区切ってtopic追加
    addTopic() {
      // 追加済みtopic名リスト作成
      const set = new Set<string>()
      for (const topic of this.topicsAdmin) {
        set.add(topic.title)
      }
      // 入力を空白で区切る
      const titles = this.inputText.split('\n')
      for (const topicTitle of titles) {
        // 空白はカウントしない
        if (topicTitle === '') continue
        // 重複してるトピックはカウントしない
        if (set.has(topicTitle)) continue

        const t: Topic = {
          id: `${getUUID()}`,
          title: topicTitle,
          description: '',
        }
        this.topicsAdmin.push(t)
        set.add(topicTitle)
      }
      this.inputText = ''
    },
    // topic反映
    startChat() {
      let alertmessage: string = ''
      // ルーム名絶対入れないとだめ
      if (this.roomName === '') {
        alertmessage = 'ルーム名を入力してください\n'
      }

      // 仮topicから空でないものをtopicsに
      for (const t in this.topicsAdmin) {
        if (this.topicsAdmin[t].title) {
          this.topics.push(this.topicsAdmin[t])
        }
      }

      // トピック0はだめ
      if (this.topics.length === 0) {
        alertmessage += 'トピック名を入力してください\n'
      }

      // ルーム名かトピック名が空ならアラート出して終了
      if (alertmessage !== '') {
        alert(alertmessage)
        return
      }

      // this.topicsをサーバに反映
      const socket = (this as any).socket
      socket.emit('CREATE_ROOM', {
        topics: this.topics,
      })

      // ルーム開始
      this.$modal.hide('sushi-modal')
    },
    // アイコン選択
    clickIcon(index: number) {
      this.iconChecked = index
    },
    // エンターキーでaddTopic呼び出し
    clickAddTopic(e: any) {
      // 日本語入力中のeventnterキー操作は無効にする
      if (e.keyCode !== 13) return
      this.addTopic()
    },
    clickDrawerMenu() {
      this.isDrawer = !this.isDrawer
      if (this.isDrawer) {
        this.hamburgerMenu = 'close'
      } else {
        this.hamburgerMenu = 'menu'
      }
    },
  },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CHAT_DUMMY_DATA = [
  {
    id: '0',
    topicId: '0',
    type: 'message',
    iconId: '0',
    content: '画像処理どうなってんの→独自実装!!?????',
    isQuestion: false,
    timestamp: 100,
  },
  {
    id: '1',
    topicId: '0',
    type: 'message',
    iconId: '1',
    content:
      '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
    isQuestion: false,
    timestamp: 200,
  },
  {
    id: '2',
    topicId: '0',
    type: 'message',
    iconId: '2',
    content: 'デザイン期間中に作ったのか！',
    isQuestion: false,
    timestamp: 300,
  },
  {
    id: '3',
    topicId: '0',
    type: 'message',
    iconId: '3',
    content: 'バックエンドはどんな技術を使ったんですか？',
    isQuestion: true,
    timestamp: 400,
  },
  {
    id: '4',
    topicId: '0',
    type: 'message',
    iconId: '4',
    content: 'チーム名の圧がすごいwwwwwwwwwww',
    isQuestion: false,
    timestamp: 500,
  },
  {
    id: '5',
    topicId: '0',
    type: 'message',
    iconId: '5',
    content: 'なんか始まった笑笑',
    isQuestion: false,
    timestamp: 600,
  },
  {
    id: '6',
    topicId: '0',
    type: 'message',
    iconId: '6',
    content: '既存のモデルそのままじゃなく独自改良してるのいいね',
    isQuestion: false,
    timestamp: 700,
  },
  {
    id: '7',
    topicId: '0',
    type: 'message',
    iconId: '7',
    content: 'チーム名からのフリとオチ面白い笑笑',
    isQuestion: false,
    timestamp: 800,
  },
  {
    id: '8',
    topicId: '0',
    type: 'reaction',
    iconId: '0',
    timestamp: 900,
    target: {
      id: '1',
      content:
        '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
    },
  },
  {
    id: '9',
    topicId: '0',
    type: 'reaction',
    iconId: '1',
    timestamp: 1000,
    target: {
      id: '2',
      content: 'デザイン期間中に作ったのか！',
    },
  },
  {
    id: '10',
    topicId: '0',
    type: 'message',
    iconId: '10',
    content: 'UIきれい!',
    isQuestion: false,
    timestamp: 100,
  },
] as const
</script>
