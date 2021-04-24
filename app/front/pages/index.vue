<template>
  <div class="container page">
    <!-- {{ chatDataList }} -->
    <div v-for="chatData in chatDataList" :key="chatData.topic.id">
      <ChatRoom :chat-data="chatData" @send-message="sendMessage" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ChatItem, Topic } from '@/models/contents'
import ChatRoom from '@/components/ChatRoom.vue'
import { io } from 'socket.io-client'

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
}

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
  mounted() {
    const socket = io(process.env.apiBaseUrl as string)
    socket.emit(
      'ENTER_ROOM',
      {
        iconId: 0,
      },
      (res: any) => {
        console.log(res)
        // FIXME: サーバから空のデータが送られてくるので暫定的に対応(yuta-ike)
        // TODO: 自分が送ったチャットデータは無視する
        // this.topics = res.topics
        // this.messages = res.messages
      }
    )
    ;(this as any).socket = socket

    // FIXME: サーバからデータが送られてこないので暫定的に対応 (yuta-ike)
    this.topics.push({ id: '0', title: 'タイトル', description: '説明' })
    // this.messages.push(...CHAT_DUMMY_DATA) // コメントインするとチャットの初期値を入れれます
  },
  methods: {
    sendMessage(message: ChatItem) {
      const socket = (this as any).socket
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', message)
      // ローカルに反映する
      this.messages.push(message)
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
