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
          <input v-model="room.title" />
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
          :topic-state="topicStates[chatData.topic.id]"
          @send-message="sendMessage"
          @send-reaction="sendReaction"
          @send-question="sendQuestion"
          @send-answer="sendAnswer"
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
import {
  Room,
  ChatItem,
  Message,
  Topic,
  TopicState,
  Stamp,
  Answer,
  Question,
} from '@/models/contents'
import {
  PostChatItemAnswerParams,
  PostChatItemMessageParams,
  PostChatItemQuestionParams,
  PostChatItemReactionParams,
} from '@/models/event'
import ChatRoom from '@/components/ChatRoom.vue'
import { io } from 'socket.io-client'
import getUUID from '@/utils/getUUID'
import {
  getSelectedIconFromJSON,
  setSelectedIconToJSON,
} from '@/utils/reserveSelectIcon'

// 1つのトピックと、そのトピックに関するメッセージ一覧を含むデータ構造
type ChatData = {
  topic: Topic
  message: ChatItem[]
}

// Data型
type DataType = {
  // 管理画面
  hamburgerMenu: string
  isDrawer: boolean
  inputText: string
  // ルーム情報
  topics: Topic[]
  topicsAdmin: Topic[]
  activeUserCount: number
  topicStates: { [key: string]: TopicState }
  room: Room
  // ユーザー関連
  isAdmin: boolean
  icons: any
  iconChecked: number
  // チャット関連
  messages: ChatItem[]
}
Vue.use(VModal)
export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
  },
  data(): DataType {
    return {
      // 管理画面
      hamburgerMenu: 'menu',
      isDrawer: false,
      inputText: '',
      // ルーム情報
      topics: [],
      topicsAdmin: [],
      activeUserCount: 0,
      topicStates: {},
      room: {} as Room,
      // ユーザー関連
      isAdmin: false,
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
      // チャット関連
      messages: [],
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
      const selectedIcon = getSelectedIconFromJSON()
      if (selectedIcon == null) {
        this.$modal.show('sushi-modal')
      } else {
        this.iconChecked = selectedIcon - 1
        this.enterRoom(selectedIcon)
      }
    }
    this.$modal.show('sushi-modal')

    // SocketIOのコールバックの登録
    socket.on('PUB_CHAT_ITEM', (chatItem: ChatItem) => {
      this.messages.push(chatItem)
    })

    socket.on('PUB_CHANGE_ACTIVE_TOPIC', (res: any) => {
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

    // socket.on('PUB_FINISH_TOPIC', (res: any) => {
    //   this.topicStates[res.topicId] = 'finished'
    //   const messageAdmin: Message = {
    //     id: `${getUUID()}`,
    //     topicId: res.topicId,
    //     type: 'message',
    //     iconId: '0',
    //     timestamp: 0,
    //     createdAt: new Date(),
    //     content: '【運営Bot】\n 以下、質問一覧です！',
    //     target: null,
    //   }
    //   this.messages.push(messageAdmin)
    //   for (const i in this.messages) {
    //     // 閉じたトピックのmessageについて
    //     if (
    //       this.messages[i].topicId === res.topicId &&
    //       this.messages[i].type === 'question'
    //     ) {
    //       // @ts-ignore
    //       const m: Message = {
    //         id: `${getUUID()}`,
    //         topicId: res.topicId,
    //         type: 'question',
    //         iconId: '0',
    //         timestamp: 0,
    //         createdAt: new Date(),
    //         // @ts-ignore
    //         content: this.messages[i].content,
    //       }
    //       this.messages.push(m)
    //     }
    //   }
    // })
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

    // ルーム情報
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
          // description: '',
          urls: { github: '', slide: '', product: '' },
        }
        this.topicsAdmin.push(t)
        set.add(topicTitle)
      }
      this.inputText = ''
    },
    // エンターキーでaddTopic呼び出し
    clickAddTopic(e: any) {
      // 日本語入力中のeventnterキー操作は無効にする
      if (e.keyCode !== 13) return
      this.addTopic()
    },
    // topic反映
    startChat() {
      let alertmessage: string = ''
      // ルーム名絶対入れないとだめ
      if (this.room.title === '') {
        alertmessage = 'ルーム名を入力してください\n'
      }

      // 仮topicから空でないものをtopicsに
      for (const t in this.topicsAdmin) {
        if (this.topicsAdmin[t].title) {
          this.topics.push(this.topicsAdmin[t])
          this.topicStates[this.topicsAdmin[t].id] = 'not-started'
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
    // アクティブトピックが変わる
    changeActiveTopic(topicId: string) {
      const socket = (this as any).socket
      socket.emit('CHANGE_ACTIVE_TOPIC', { topicId })
    },

    // ユーザ関連
    // modalを消し、topic作成
    hide(): any {
      this.$modal.hide('sushi-modal')
      this.enterRoom(this.iconChecked + 1)
    },
    // ルーム入室
    enterRoom(iconId: number) {
      const socket = (this as any).socket
      socket.emit(
        'ENTER_ROOM',
        {
          iconId,
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (res: any) => {
          // this.topics = res.topics
          // this.messages = res.chatItems ?? []
          // this.topicStates[res.activeTopicId] = 'ongoing'
          this.topics = TOPICS
          this.messages = CHAT_DUMMY_DATA
          this.topics.forEach(({ id }) => {
            this.topicStates[id] = 'not-started'
          })
          this.topicStates[1] = 'active'
        }
      )
      setSelectedIconToJSON(iconId)
    },
    // アイコン選択
    clickIcon(index: number) {
      this.iconChecked = index
    },

    // チャット関連
    sendMessage(
      text: string,
      topicId: string,
      target: Message | Answer | null
    ) {
      console.log('send message: ', text)
      const socket = (this as any).socket
      const params: PostChatItemMessageParams = {
        type: 'message',
        id: getUUID(),
        topicId,
        content: text,
        target: target?.id ?? null,
      }
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', params)
      // NOTE: サーバと処理を共通化したい
      // ローカルに反映する
      this.messages.push({
        id: params.id,
        type: 'message',
        topicId,
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        content: text,
        createdAt: new Date(),
        target,
        timestamp: 60000, // TODO: 正しいタイムスタンプを設定する
      })
    },
    sendReaction(message: Message) {
      console.log('send reaction: ', message.content)
      const socket = (this as any).socket
      const params: PostChatItemReactionParams = {
        id: getUUID(),
        topicId: message.topicId,
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
        createdAt: new Date(),
        target: message,
      })
    },
    sendQuestion(text: string, topicId: string) {
      console.log('send question: ', text)
      const socket = (this as any).socket
      const params: PostChatItemQuestionParams = {
        type: 'question',
        id: getUUID(),
        topicId,
        content: text,
      }
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', params)
      // NOTE: サーバと処理を共通化したい
      // ローカルに反映する
      this.messages.push({
        id: params.id,
        type: 'question',
        topicId,
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        content: text,
        createdAt: new Date(),
        timestamp: 60000, // TODO: 正しいタイムスタンプを設定する
      })
    },
    sendAnswer(text: string, question: Question) {
      console.log('send answer: ', text)
      const socket = (this as any).socket
      const params: PostChatItemAnswerParams = {
        id: getUUID(),
        topicId: question.topicId,
        type: 'answer',
        target: question.id,
        content: text,
      }
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', params)
      // ローカルに反映する
      this.messages.push({
        id: params.id,
        topicId: params.topicId,
        type: 'answer',
        iconId: (this.iconChecked + 1).toString(), // 運営のお茶の分足す
        timestamp: 1100, // TODO: 正しいタイムスタンプを設定する
        createdAt: new Date(),
        target: question,
        content: text,
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
