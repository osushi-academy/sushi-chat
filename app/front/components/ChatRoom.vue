<template>
  <article v-if="topic" class="topic-block">
    <TopicHeader
      :title="topic.title"
      :topic-index="topicIndex"
      :bookmark-item="pinnedChatItem"
      @download="clickDownload"
      @click-show-all="clickShowAll"
      @click-not-show-all="clickNotShowAll"
    />
    <div class="chat-area">
      <div class="text-zone">
        <transition-group
          :id="topicId"
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
              v-if="
                isAllCommentShowed ||
                message.type == 'question' ||
                message.type == 'answer'
              "
              :message-id="message.id"
              :topic-id="topicId"
              :message="message"
              @click-thumb-up="clickReaction"
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
          <AnalysisGraph :topic-title="topic.title" :topic-id="topicId" />
        </div>
        <button
          v-if="topicState === 'finished' && !showGraph"
          :key="topicId"
          class="show-graph-button"
          @click="showGraph = true"
        >
          盛り上がりグラフを見る
          <ChevronUpIcon class="toggle-icon" size="14"></ChevronUpIcon>
        </button>
      </div>
      <div class="stamp-zone">
        <FavoriteButton
          :disabled="topicState !== 'ongoing'"
          :topic-id="topicId"
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
    <TextArea
      :topic-title="topic.title"
      :topic-id="topicId"
      :disabled="topicState == 'not-started'"
      :selected-chat-item="selectedChatItem"
      @submit="clickSubmit"
      @deselectChatItem="deselectChatItem"
    />
  </article>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import throttle from "lodash.throttle"
import { XIcon, ChevronUpIcon } from "vue-feather-icons"
import { ChatItemModel, TopicState } from "sushi-chat-shared"
import AnalysisGraph from "./AnalysisGraph.vue"
import TopicHeader from "@/components/TopicHeader.vue"
import MessageComponent from "@/components/Message.vue"
import TextArea from "@/components/TextArea.vue"
import FavoriteButton from "@/components/FavoriteButton.vue"
import exportText from "@/utils/textExports"
import { ChatItemStore, TopicStore, PinnedChatItemsStore } from "~/store"

// Data型
type DataType = {
  isNotify: boolean
  selectedChatItem: ChatItemModel | null
  showGraph: boolean
  isAllCommentShowed: boolean
}

export default Vue.extend({
  name: "ChatRoom",
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
    topicId: {
      type: Number,
      required: true,
    },
    topicIndex: {
      type: Number,
      required: true,
    },
    topicState: {
      type: String,
      default: "not-started",
    } as PropOptions<TopicState>,
  },
  data(): DataType {
    return {
      isNotify: false,
      selectedChatItem: null,
      showGraph: false,
      isAllCommentShowed: true,
    }
  },
  computed: {
    chatItems() {
      return ChatItemStore.chatItems.filter(
        ({ topicId }) => topicId === this.topicId,
      )
    },
    topic() {
      return TopicStore.topics.find(({ id }) => id === this.topicId)
    },
    pinnedChatItem() {
      const chatItems = ChatItemStore.chatItems.filter(
        ({ topicId }) => topicId === this.topicId,
      )
      const pinnedChatItems = PinnedChatItemsStore.pinnedChatItems
      return chatItems.find((chatItem) => pinnedChatItems.includes(chatItem.id))
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
      element.addEventListener("scroll", this.handleScroll)
      element.scrollTo({
        top: element.scrollHeight,
        left: 0,
      })
    }
  },
  beforeDestroy() {
    const element = (this.$refs.scrollable as Vue).$el
    if (element != null) {
      element.removeEventListener("scroll", this.handleScroll)
    }
  },
  methods: {
    // 送信ボタン
    clickSubmit(text: string, isQuestion: boolean) {
      const target = this.selectedChatItem
      const topicId = this.topicId
      if (target == null) {
        if (isQuestion) {
          // 質問
          ChatItemStore.postQuestion({ text, topicId })
        } else {
          // 通常メッセージ
          ChatItemStore.postMessage({ text, topicId })
        }
      } else if (target.type === "message" || target.type === "answer") {
        // リプライ
        ChatItemStore.postMessage({ text, topicId, target })
      } else if (target.type === "question") {
        // 回答
        ChatItemStore.postAnswer({ text, topicId, target })
      }
      this.clickScroll()
      this.selectedChatItem = null
    },
    // リアクションボタン
    clickReaction(message: ChatItemModel) {
      ChatItemStore.postReaction({ message })
    },
    // スクロール
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
          behavior: "smooth",
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
          behavior: "smooth",
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
    clickDownload() {
      const messages = ChatItemStore.chatItems
        .filter(({ type }) => type === "message")
        .filter(({ iconId }) => iconId !== 0)
        .map(
          (message) =>
            "🍣: " + (message.content as string).replaceAll("\n", "\n") + "\n",
        )
      // this.topicがnullになることは基本的にない
      if (this.topic) {
        exportText(`${this.topicIndex}_${this.topic.title}_comments`, [
          this.topic.title + "\n",
          ...messages,
        ])
      }
    },
    // 選択したアイテム取り消し
    deselectChatItem() {
      this.selectedChatItem = null
    },
    clickShowAll() {
      this.isAllCommentShowed = true
    },
    clickNotShowAll() {
      this.isAllCommentShowed = false
    },
  },
})
</script>
