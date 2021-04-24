<template>
  <article class="topic-block">
    <TopicHeader :title="Number(topic.id) + 1 + '. ' + topic.title" />
    <div class="chat-area">
      <div class="text-zone">
        <div :id="topic.id" class="scrollable">
          <div v-for="message in messages" :key="message.id">
            <MessageComponent :message="message" @good="clickGood" />
          </div>
        </div>
      </div>
      <div class="stamp-zone">
        <FavoriteButton @favorite="clickFavorite" />
      </div>
      <button v-show="isNotify" class="message-badge" @click="clickScroll">
        最新のコメント
        <div class="material-icons">arrow_downward</div>
      </button>
    </div>
    <TextArea :topic="topic" @submit="clickSubmit" />
  </article>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import * as Model from '@/models/contents'
import TopicHeader from '@/components/TopicHeader.vue'
import MessageComponent from '@/components/Message.vue'
import TextArea from '@/components/TextArea.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

// Data型
type DataType = {
  messages: Model.ChatItem[]
  isNotify: boolean
}

export default Vue.extend({
  name: 'ChatRoom',
  components: {
    TopicHeader,
    MessageComponent,
    TextArea,
    FavoriteButton,
  },
  props: {
    topic: {
      type: Object,
      required: true,
    } as PropOptions<Model.TopicPropType>,
  },
  data(): DataType {
    return {
      messages: [
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
      ],
      isNotify: false,
    }
  },
  methods: {
    getId(): string {
      return uuidv4()
    },
    // 送信ボタン
    clickSubmit(message: Model.Message) {
      this.messages.push(message)
    },
    // いいねボタン
    async clickGood(message: Model.Message) {
      // いいねmessage
      const m: Model.Reaction = {
        id: `${this.getId()}`,
        topicId: message.topicId,
        type: 'reaction',
        iconId: '0',
        target: {
          id: message.id,
          content: message.content,
        },
        timestamp: 1100,
      }
      // submit
      await this.messages.push(m)

      // スクロール
      const element: HTMLElement | null = document.getElementById(this.topic.id)
      if (element) {
        // 下までスクロールされていなければ通知を出す
        // if (this.isScrollBottom(element)) {
        //   element.scrollTo({
        //     top: element.scrollHeight,
        //     left: 0,
        //     behavior: 'smooth',
        //   })
        // } else {
        //   this.isNotify = true
        // }
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
      }
    },
    // ハートボタン
    clickFavorite() {},
    // いちばん下までスクロール
    clickScroll() {
      const element: HTMLElement | null = document.getElementById(this.topic.id)
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
        this.isNotify = false
      }
    },
    // いちばん下までスクロールしてあるか
    isScrollBottom(element: HTMLElement): Boolean {
      return (
        element.scrollHeight < element.scrollTop + element.offsetHeight + 200
      )
    },
  },
})
</script>
