<template>
  <div class="container page">
    <!-- {{ chatDataList }} -->
    <div v-for="chatData in chatDataList" :key="chatData.topic.id">
      <ChatRoom :chat-data="chatData" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ChatItem, Topic } from '@/models/contents'
import ChatRoom from '@/components/ChatRoom.vue'
import { io } from 'socket.io-client'

// Data型
type DataType = {
  chatDataList: {
    topic: Topic
    message: ChatItem[]
  }[]
  activeUserCount: number
  isNotify: boolean
}

export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
  },
  data(): DataType {
    return {
      chatDataList: [],
      activeUserCount: 0,
      isNotify: false,
    }
  },
  mounted() {
    const socket = io(process.env.apiBaseUrl as string)
    socket.emit(
      'ENTER_ROOM',
      {
        iconId: 0,
      },
      (res: any) => {
        this.chatDataList = Object.fromEntries(
          res.topics.map((topic: any) => [
            topic.id,
            {
              topic,
              message: res.chatItems.filter(
                (chatItem: any) => chatItem.topicId === topic.id
              ),
            },
          ])
        ) as { topic: Topic; message: ChatItem[] }[]
        this.activeUserCount = res.activeUserCount
      }
    )
    ;(this as any).socket = socket

    // this.chatDataList.push({
    //   topic: { id: '01', title: 'タイトル', description: '説明' },
    //   message: [
    //     {
    //       id: '0',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '0',
    //       content: '画像処理どうなってんの→独自実装!!?????',
    //       isQuestion: false,
    //       timestamp: 100,
    //     },
    //     {
    //       id: '1',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '1',
    //       content:
    //         '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
    //       isQuestion: false,
    //       timestamp: 200,
    //     },
    //     {
    //       id: '2',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '2',
    //       content: 'デザイン期間中に作ったのか！',
    //       isQuestion: false,
    //       timestamp: 300,
    //     },
    //     {
    //       id: '3',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '3',
    //       content: 'バックエンドはどんな技術を使ったんですか？',
    //       isQuestion: true,
    //       timestamp: 400,
    //     },
    //     {
    //       id: '4',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '4',
    //       content: 'チーム名の圧がすごいwwwwwwwwwww',
    //       isQuestion: false,
    //       timestamp: 500,
    //     },
    //     {
    //       id: '5',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '5',
    //       content: 'なんか始まった笑笑',
    //       isQuestion: false,
    //       timestamp: 600,
    //     },
    //     {
    //       id: '6',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '6',
    //       content: '既存のモデルそのままじゃなく独自改良してるのいいね',
    //       isQuestion: false,
    //       timestamp: 700,
    //     },
    //     {
    //       id: '7',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '7',
    //       content: 'チーム名からのフリとオチ面白い笑笑',
    //       isQuestion: false,
    //       timestamp: 800,
    //     },
    //     {
    //       id: '8',
    //       topicId: '0',
    //       type: 'reaction',
    //       iconId: '0',
    //       timestamp: 900,
    //       target: {
    //         id: '1',
    //         content:
    //           '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
    //       },
    //     },
    //     {
    //       id: '9',
    //       topicId: '0',
    //       type: 'reaction',
    //       iconId: '1',
    //       timestamp: 1000,
    //       target: {
    //         id: '2',
    //         content: 'デザイン期間中に作ったのか！',
    //       },
    //     },
    //     {
    //       id: '10',
    //       topicId: '0',
    //       type: 'message',
    //       iconId: '10',
    //       content: 'UIきれい!',
    //       isQuestion: false,
    //       timestamp: 100,
    //     },
    //   ],
    // })
  },
  methods: {
    // sendMessage(topicId: string, content: string, isQuestion: boolean) {
    //   const socket = (this as any).socket
    //   socket.emit('POST_CHAT_ITEM', {
    //     type: 'message',
    //     id: 'dummy-id',
    //     topicId,
    //     content,
    //     isQuestion,
    //   })
    // },
  },
})
</script>
