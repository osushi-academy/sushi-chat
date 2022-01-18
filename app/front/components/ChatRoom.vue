<template>
  <article v-if="topic" class="topic-block">
    <TopicHeader
      :title="topic.title"
      :topic-index="topicId"
      :pinned-chat-item="pinnedChatItem"
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
              :topic-id="topicId"
              :message="message"
              @click-thumb-up="clickReaction"
              @click-reply="selectChatItem(message)"
              @click-pin="pinChatItem(message.id)"
            />
          </div>
        </transition-group>
        <div v-if="showGraph" class="graph-wrapper">
          <div class="graph-action-area" style="text-align: end">
            <button @click="showGraph = false">
              <span class="close-button">
                <XIcon></XIcon>
              </span>
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
        :class="{ isNotify }"
        @click="scrollToBottom"
      >
        <ArrowDownIcon size="1.2x"></ArrowDownIcon>
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
import { XIcon, ChevronUpIcon, ArrowDownIcon } from "vue-feather-icons"
import { ChatItemModel, TopicState } from "sushi-chat-shared"
import AnalysisGraph from "./AnalysisGraph.vue"
import TopicHeader from "@/components/TopicHeader.vue"
import MessageComponent from "@/components/Message.vue"
import TextArea from "@/components/TextArea.vue"
import FavoriteButton from "@/components/FavoriteButton.vue"
import exportText from "@/utils/textExports"
import { ChatItemStore, TopicStore, PinnedChatItemsStore } from "~/store"
import { ChatItemWithStatus } from "~/store/chatItems"

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
    ArrowDownIcon,
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
        (chatItemModel): chatItemModel is ChatItemWithStatus =>
          chatItemModel.topicId === this.topicId,
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
    async clickSubmit(text: string, isQuestion: boolean) {
      const target = this.selectedChatItem ?? undefined
      const topicId = this.topicId
      try {
        if (target == null || target.type !== "question") {
          // リプライ
          if (isQuestion) {
            // 質問
            await ChatItemStore.postQuestion({ text, topicId, target })
          } else {
            // 通常メッセージ
            await ChatItemStore.postMessage({
              text,
              topicId,
              target,
            })
          }
        } else if (target.type === "question") {
          // 回答
          await ChatItemStore.postAnswer({ text, topicId, target })
        }
      } catch (e) {
        window.alert("メッセージの送信に失敗しました")
      }
      this.scrollToBottom()
      this.selectedChatItem = null
    },
    // リアクションボタン
    async clickReaction(message: ChatItemModel) {
      try {
        await ChatItemStore.postReaction({ message })
      } catch (e) {
        window.alert("リアクションの送信に失敗しました")
      }
    },
    // リプライ先のChatItemを選択し、textareaにフォーカス
    selectChatItem(message: ChatItemModel) {
      this.selectedChatItem = message
      const e = document.getElementById("textarea-" + this.topicId)
      if (e) {
        e.focus()
      }
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
    scrollToBottom() {
      const element: Element | null = (this.$refs.scrollable as Vue).$el
      console.log(element?.scrollHeight)
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
      Vue.nextTick(() => {
        setTimeout(() => this.scrollToBottom(), 100)
      })
    },
    clickNotShowAll() {
      this.isAllCommentShowed = false
    },
    async pinChatItem(chatItemId: string) {
      try {
        if (!this.pinnedChatItem) {
          // 新規でピン留め
          await PinnedChatItemsStore.send({
            topicId: this.topicId,
            chatItemId,
          })
        } else if (this.pinnedChatItem.id === chatItemId) {
          // this.pinnedChatItemを外す
          await PinnedChatItemsStore.send({
            topicId: this.topicId,
            chatItemId,
          })
        } else {
          // TODO: ここも本来はサーバー側で対応したい（既存のピン留めがあればサーバ側で自動で外す）
          // this.pinnedChatItemを外して、ピン留め
          await PinnedChatItemsStore.send({
            topicId: this.topicId,
            chatItemId: this.pinnedChatItem.id,
          })
          await PinnedChatItemsStore.send({
            topicId: this.topicId,
            chatItemId,
          })
        }
      } catch (e) {
        console.error(e)
        window.alert("ピン留めのリクエストに失敗しました")
      }
    },
  },
})
</script>
