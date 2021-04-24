<template>
  <div class="container page">
    <modal v-if="isAdmin" name="topic-modal">
      <div class="modal-header">
        <h2>トピック作成</h2>
      </div>
      <div class="modal-body">
        <div v-for="(topic, index) in topics" :key="index">
          <input
            v-model="topic.content"
            class="textarea"
            contenteditable
            placeholder="トピック名"
            @keydown.enter.exact="addTopic"
          />
          <button type="button" @click="removeTopic(index)">削除</button>
        </div>
        <button type="button" @click="addTopic">追加</button>
        <button type="button" @click="hide">はじめる</button>
      </div>
    </modal>
    <modal v-if="!isAdmin" name="sushi-modal" :click-to-close="false">
      <div class="modal-header">
        <h2>アイコンを選んでね</h2>
      </div>
      <div class="modal-body">
        <div class="icon-list">
          <div
            v-for="(icon, index) in icons"
            :key="index"
            :class="{ 'icon-selected': iconChecked == index }"
            class="icon-box"
          >
            <img
              :src="icon.url"
              alt=""
              class="sushi-fit"
              @click="clickIcon(index)"
            />
          </div>
        </div>
        <button v-if="iconChecked >= 0" type="button" @click="hide">
          はじめる
        </button>
      </div>
    </modal>
    <div v-for="chatData in chatDataList" :key="chatData.topic.id">
      <ChatRoom
        :chat-data="chatData"
        :my-icon="iconChecked"
        @send-message="sendMessage"
        @send-reaction="sendReaction"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import VModal from 'vue-js-modal'
import { ChatItem, Message, Topic } from '@/models/contents'
import {
  PostChatItemMessageParams,
  PostChatItemReactionParams,
} from '@/models/event'
import ChatRoom from '@/components/ChatRoom.vue'
import { io } from 'socket.io-client'
import getUUID from '@/utils/getUUID'

// 1つのトピックと、そのトピックに関するメッセージ一覧を含むデータ構造
type ChatData = {
  topic: Topic
  message: ChatItem[]
}

// Data型
type DataType = {
  activeUserCount: number
  isNotify: boolean
  topics: Topic[]
  messages: ChatItem[]
  isAdmin: boolean
  icons: any
  iconChecked: number
}
Vue.use(VModal)
export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
  },
  data(): DataType {
    return {
      topics: [],
      messages: [],
      activeUserCount: 0,
      isNotify: false,
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
    if (this.isAdmin) {
      this.$modal.show('topic-modal')
    } else {
      this.$modal.show('sushi-modal')
    }

    const socket = io(process.env.apiBaseUrl as string)
    socket.emit(
      'ENTER_ROOM',
      {
        iconId: 0,
      },
      (res: any) => {
        // FIXME: サーバから空のデータが送られてくるので暫定的にコメントアウト(yuta-ike)
        // this.topics = res.topics
        this.messages = res.chatItems ?? []
      }
    )
    ;(this as any).socket = socket

    // FIXME: サーバからデータが送られてこないので暫定的に対応 (yuta-ike)
    this.topics.push({ id: '0', title: 'タイトル', description: '説明' })

    socket.on('PUB_CHAT_ITEM', (res: any) => {
      if (!this.messages.find((message) => message.id === res.content.id)) {
        this.messages.push(res.content)
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
    // modalを消し、topic作成
    hide(): any {
      this.topics.push()
      if (this.isAdmin) {
        this.$modal.hide('topic-modal')
      } else {
        this.$modal.hide('sushi-modal')
      }
    },
    // 該当するtopicを削除
    removeTopic(index: number) {
      this.topics.splice(index, 1)
    },
    // topic追加
    addTopic() {
      // 新規topic
      const t: Topic = {
        id: `${getUUID()}`,
        title: '',
        description: '',
      }
      this.topics.push(t)
    },
    // アイコン選択
    clickIcon(index: number) {
      this.iconChecked = index
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
