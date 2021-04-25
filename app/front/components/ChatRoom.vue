<template>
  <article class="topic-block">
    <TopicHeader
      :title="topicIndex + 1 + '. ' + chatData.topic.title"
      :is-active-topic="isActiveTopic"
      :is-finished-topic="isFinishedTopic"
      :is-admin="isAdmin"
      @topic-activate="clickTopicActivate"
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
        <FavoriteButton
          :favorite-callback-register="
            (callback) => favoriteCallbackRegister(chatData.topic.id, callback)
          "
          @favorite="clickFavorite"
        />
      </div>
      <button v-show="isNotify" class="message-badge" @click="clickScroll">
        最新のコメント
        <div class="material-icons">arrow_downward</div>
      </button>
    </div>
    <TextArea
      :topic="chatData.topic"
      :my-icon="myIcon"
      :disabled="isNotStartedTopic"
      @submit="clickSubmit"
    />
  </article>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Topic, ChatItem, Message } from '@/models/contents'
import TopicHeader from '@/components/TopicHeader.vue'
import MessageComponent from '@/components/Message.vue'
import TextArea from '@/components/TextArea.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

type ChatDataPropType = {
  topic: Topic
  message: ChatItem[]
}

type FavoriteCallbackRegisterPropType = {
  favoriteCallbackRegister: (
    topicId: string,
    callback: (count: number) => void
  ) => void
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
    topicIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    favoriteCallbackRegister: {
      type: Function,
      required: true,
    } as PropOptions<FavoriteCallbackRegisterPropType>,
    myIcon: {
      type: Number,
      required: true,
    },
    isActiveTopic: {
      type: Boolean,
      required: true,
    },
    isFinishedTopic: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
    },
  },
  data(): DataType {
    return {
      isNotify: false,
    }
  },
  computed: {
    isNotStartedTopic() {
      return !this.isActiveTopic && !this.isFinishedTopic
    },
  },
  watch: {
    chatData() {
      Vue.nextTick(() => {
        this.scrollToBottomOrShowModal()
      })
    },
  },
  methods: {
    // 送信ボタン
    clickSubmit(text: string, isQuestion: boolean) {
      this.$emit('send-message', text, this.chatData.topic.id, isQuestion)
      this.clickScroll()
    },
    // いいねボタン
    clickGood(message: Message) {
      // submit
      this.$emit('send-reaction', message)
    },
    // ハートボタン
    clickFavorite() {
      this.$emit('send-stamp', this.chatData.topic.id)
    },
    scrollToBottomOrShowModal() {
      // 下までスクロールされていなければ通知を出す
      const element: HTMLElement | null = document.getElementById(
        this.chatData.topic.id
      )
      if (element == null) return
      if (this.isScrollBottom(element)) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
      } else {
        this.isNotify = true
      }
    },
    // いちばん下までスクロール
    clickScroll() {
      const element: HTMLElement | null = document.getElementById(
        this.chatData.topic.id
      )
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
    clickTopicActivate() {
      this.$emit('topic-activate', this.chatData.topic.id)
    },
  },
})
</script>
