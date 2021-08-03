<template>
  <article class="topic-block">
    <TopicHeader
      :title="topicIndex + '. ' + chatData.topic.title"
      :topic-state="topicState"
      @topic-activate="clickTopicActivate"
      @download="clickDownload"
    />
    <div class="chat-area">
      <div class="text-zone">
        <transition-group
          :id="chatData.topic.id"
          ref="scrollable"
          class="scrollable list-complete"
          tag="div"
        >
          <div
            v-for="message in chatItems"
            :key="message.id"
            class="list-complete-item"
          >
            <MessageComponent
              :message="message"
              @click-card="clickReaction"
              @click-reply="selectedChatItem = message"
            />
          </div>
        </transition-group>
        <div v-if="showGraph" class="graph-wrapper">
          <div class="graph-action-area" style="text-align: end">
            <button class="close-button" @click="showGraph = false">
              <XIcon></XIcon>
            </button>
          </div>
          <AnalysisGraph :chat-data="chatData" />
        </div>
        <button
          v-if="topicState === 'finished' && !showGraph"
          :key="chatData.topic.id"
          class="show-graph-button"
          @click="showGraph = true"
        >
          盛り上がりグラフを見る
          <ChevronUpIcon class="toggle-icon" size="14"></ChevronUpIcon>
        </button>
      </div>
      <div class="stamp-zone">
        <FavoriteButton
          :favorite-callback-register="
            (callback) => favoriteCallbackRegister(chatData.topic.id, callback)
          "
          :disabled="topicState !== 'active'"
          @favorite="clickFavorite"
        />
      </div>
      <button
        class="message-badge"
        :style="{ transform: `translate(-50%, ${isNotify ? 0 : 150}%)` }"
        @click="clickScroll"
      >
        最新のコメント
        <div class="material-icons">arrow_downward</div>
      </button>
    </div>
    <div v-if="selectedChatItem" class="reply-bar">
      <div class="reply-content">{{ selectedChatItem.content }} に返信中</div>
      <div class="material-icons" @click="deselectChatItem">close</div>
    </div>
    <TextArea
      :topic="chatData.topic"
      :disabled="isNotStartedTopic"
      @submit="clickSubmit"
    />
  </article>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Topic, Message, TopicState, Question, Answer } from '@/models/contents'
import throttle from 'lodash.throttle'
import TopicHeader from '@/components/TopicHeader.vue'
import MessageComponent from '@/components/Message.vue'
import TextArea from '@/components/TextArea.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import exportText from '@/utils/textExports'
import { XIcon, ChevronUpIcon } from 'vue-feather-icons'
import AnalysisGraph from './AnalysisGraph.vue'
import { ChatItemStore } from '~/store'

type ChatDataPropType = {
  topic: Topic
}

type FavoriteCallbackRegisterPropType = (
  topicId: string,
  callback: (count: number) => void
) => void

// Data型
type DataType = {
  isNotify: boolean
  selectedChatItem: Message | Question | Answer | null
  showGraph: boolean
}

export default Vue.extend({
  name: 'ChatRoom',
  components: {
    TopicHeader,
    MessageComponent,
    TextArea,
    FavoriteButton,
    AnalysisGraph,
    XIcon,
    ChevronUpIcon,
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
    topicState: {
      type: String,
      required: true,
    } as PropOptions<TopicState>,
  },
  data(): DataType {
    return {
      isNotify: false,
      selectedChatItem: null,
      showGraph: false,
    }
  },
  computed: {
    isNotStartedTopic() {
      return this.topicState === 'not-started'
    },
    chatItems() {
      return ChatItemStore.chatItems.filter(
        ({ topicId }) => topicId === this.chatData.topic.id
      )
    },
  },
  watch: {
    chatItems() {
      Vue.nextTick(() => {
        this.scrollToBottomOrShowModal()
      })
    },
  },
  mounted() {
    const element = (this.$refs.scrollable as Vue).$el
    if (element != null) {
      element.addEventListener('scroll', this.handleScroll)
      element.scrollTo({
        top: element.scrollHeight,
        left: 0,
      })
    }
  },
  beforeDestroy() {
    const element = (this.$refs.scrollable as Vue).$el
    if (element != null) {
      element.removeEventListener('scroll', this.handleScroll)
    }
  },
  methods: {
    // 送信ボタン
    clickSubmit(text: string, isQuestion: boolean) {
      const target = this.selectedChatItem
      const topicId = this.chatData.topic.id
      if (target == null) {
        if (isQuestion) {
          // 質問
          ChatItemStore.postQuestion({ text, topicId })
        } else {
          // 通常メッセージ
          ChatItemStore.postMessage({ text, topicId })
        }
      } else if (target.type === 'message' || target.type === 'answer') {
        // リプライ
        ChatItemStore.postMessage({ text, topicId, target })
      } else if (target.type === 'question') {
        // 回答
        ChatItemStore.postAnswer({ text, topicId, target })
      }
      this.clickScroll()
      this.selectedChatItem = null
    },
    clickReaction(message: Message) {
      ChatItemStore.postReaction({ message })
    },
    // ハートボタン
    clickFavorite() {
      this.$emit('send-stamp', this.chatData.topic.id)
    },
    handleScroll: throttle(function (this: any, e: Event) {
      if (!this.isScrollBottom(e.target)) {
        this.isNotify = true
      } else {
        this.isNotify = false
      }
    }, 500),
    scrollToBottomOrShowModal() {
      // 下までスクロールされていなければ通知を出す
      const element = (this.$refs.scrollable as Vue).$el
      if (this.isScrollBottom(element)) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
      }
    },
    // いちばん下までスクロール
    clickScroll() {
      const element: Element | null = (this.$refs.scrollable as Vue).$el
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
    isScrollBottom(element: any): boolean {
      return (
        element.scrollHeight < element.scrollTop + element.offsetHeight + 200
      )
    },
    clickTopicActivate() {
      this.$emit('topic-activate', this.chatData.topic.id)
    },
    clickDownload() {
      const messages = ChatItemStore.chatItems
        .filter(({ type }) => type === 'message')
        .filter(({ iconId }) => iconId !== '0')
        .map(
          (message) =>
            '🍣: ' + (message as Message).content.replaceAll('\n', '\n') + '\n'
        )
      exportText(`${this.topicIndex}_${this.chatData.topic.title}_comments`, [
        this.chatData.topic.title + '\n',
        ...messages,
      ])
    },
    // 選択したアイテム取り消し
    deselectChatItem() {
      this.selectedChatItem = null
    },
  },
})
</script>
