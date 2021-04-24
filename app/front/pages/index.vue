<template>
  <div class="container page">
    <modal v-if="isAdmin" name="sushi-modal" :click-to-close="false">
      <div class="modal-header">
        <h2>トピック作成</h2>
      </div>
      <div class="modal-body modal-scrollable">
        <div v-for="(topic, index) in topicsAdmin" :key="index">
          <input
            v-model="topicsAdmin[index].title"
            name="titleArea"
            class="textarea"
            contenteditable
            placeholder="トピック名"
          />
          <button type="button" @click="removeTopic(index)">削除</button>
        </div>
        <button type="button" @click="addTopic">追加</button>
        <button type="button" @click="startChat">はじめる</button>
      </div>
    </modal>
    <modal v-if="!isAdmin" name="sushi-modal">
      <div class="modal-header">
        <h2>寿司を選んでね</h2>
      </div>
      <div class="modal-body">
        <button type="button" @click="hide">はじめる</button>
      </div>
    </modal>
    <div v-for="(chatData, topicIndex) in chatDataList" :key="topicIndex">
      <ChatRoom
        :chat-data="chatData"
        :topic-index="topicIndex"
        @send-message="sendMessage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
// @ts-ignore
import VModal from 'vue-js-modal'
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
  topicsAdmin: Topic[]
  messages: ChatItem[]
  isAdmin: boolean
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
      topicsAdmin: [],
      messages: [],
      activeUserCount: 0,
      isNotify: false,
      isAdmin: false,
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
    this.$modal.show('sushi-modal')

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
  },
  methods: {
    sendMessage(message: ChatItem) {
      const socket = (this as any).socket
      // サーバーに反映する
      socket.emit('POST_CHAT_ITEM', message)
      // ローカルに反映する
      this.messages.push(message)
    },
    getId(): string {
      return uuidv4()
    },
    // modalを消し、topic作成
    hide(): any {
      this.topics.push()
      this.$modal.hide('sushi-modal')
    },
    // 該当するtopicを削除
    removeTopic(index: number) {
      this.topicsAdmin.splice(index, 1)
    },
    // topic追加
    addTopic() {
      // 新規仮topic
      const t: Topic = {
        id: `${this.getId()}`,
        title: '',
        description: '',
      }
      this.topicsAdmin.push(t)
    },
    // topic反映
    startChat() {
      // 仮topicから空でないものをtopicに
      for (const t in this.topicsAdmin) {
        if (this.topicsAdmin[t].title) {
          this.topics.push(this.topicsAdmin[t])
        }
      }
      // ルーム開始
      this.$modal.hide('sushi-modal')
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
