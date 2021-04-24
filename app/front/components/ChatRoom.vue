<template>
  <article class="topic-block">
    <TopicHeader
      :title="Number(chatData.topic.id) + 1 + '. ' + chatData.topic.title"
    />
    <div class="chat-area">
      <div class="text-zone">
        <div :id="chatData.topic.id" class="scrollable">
          <div v-for="message in chatData.message" :key="message.id">
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
    <TextArea :topic="chatData.topic" @submit="clickSubmit" />
  </article>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import { Topic, ChatItem, Message, Reaction } from '@/models/contents'
import TopicHeader from '@/components/TopicHeader.vue'
import MessageComponent from '@/components/Message.vue'
import TextArea from '@/components/TextArea.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

type ChatDataPropType = {
  topic: Topic
  message: ChatItem[]
}

// Data型
type DataType = {
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
    chatData: {
      type: Object,
      required: true,
    } as PropOptions<ChatDataPropType>,
  },
  data(): DataType {
    return {
      isNotify: false,
    }
  },
  methods: {
    getId(): string {
      return uuidv4()
    },
    // 送信ボタン
    clickSubmit(message: Message) {
      // this.messages.push(message)
    },
    // いいねボタン
    clickGood(message: Message) {
      const m: Reaction = {
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
      // this.messages.push(m)

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
