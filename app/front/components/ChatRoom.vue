<template>
  <article class="topic-block">
    <TopicHeader
      :title="topicIndex + 1 + '. ' + chatData.topic.title"
      :is-admin="isAdmin"
      :is-active-topic="isActiveTopic"
      :is-finished-topic="isFinishedTopic"
      @topic-activate="clickTopicActivate"
      @download="clickDownload"
    />
    <div class="chat-area">
      <div class="text-zone">
        <transition-group
          :id="chatData.topic.id"
          class="scrollable list-complete"
          tag="div"
        >
          <div
            v-for="message in chatData.message"
            :key="message.id"
            class="list-complete-item"
          >
            <MessageComponent :message="message" @good="clickGood" />
          </div>
          <div
            v-if="isFinishedTopic"
            :key="chatData.topic.id"
            class="list-complete-item"
          >
            <AnalysisGraph :chat-data="chatData" />
          </div>
        </transition-group>
      </div>
      <div class="stamp-zone">
        <FavoriteButton
          :favorite-callback-register="
            (callback) => favoriteCallbackRegister(chatData.topic.id, callback)
          "
          :disabled="!isActiveTopic"
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
import exportText from '@/utils/textExports'
import AnalysisGraph from './AnalysisGraph.vue'

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
    AnalysisGraph,
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
    isAdmin: {
      type: Boolean,
      required: true,
    },
    isFinishedTopic: {
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
    clickDownload() {
      const messages = this.chatData.message
        .filter(({ type }) => type === 'message')
        .filter(({ iconId }) => iconId !== '0')
        .map(
          (message) =>
            '🍣: ' + (message as Message).content.replaceAll('\n', '\n') + '\n'
        )
      exportText(`${this.chatData.topic.title}_comments`, [
        this.chatData.topic.title + '\n',
        ...messages,
      ])
    },
  },
})
</script>
