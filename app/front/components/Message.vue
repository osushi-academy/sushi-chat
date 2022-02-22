<template>
  <div class="chatitem-wrapper">
    <!-- Message -->
    <article
      v-if="message.type != 'reaction' && message.senderType !== 'system'"
      :id="message.id"
      class="comment"
      :class="{
        admin: message.iconId == 0,
        question: message.type == 'question',
        answer: message.type == 'answer',
        badgecomment:
          message.senderType === 'admin' || message.senderType === 'speaker',
      }"
    >
      <!-- バッジ -->
      <div v-if="message.senderType === 'admin'" class="sender-badge">
        from 運営
      </div>
      <div v-else-if="message.senderType === 'speaker'" class="sender-badge">
        from スピーカー
      </div>
      <div v-else class="sender-non-badge"></div>
      <div class="main-contents">
        <div class="icon-wrapper">
          <picture>
            <source :srcset="icon.webp" type="image/webp" />
            <img :src="icon.png" alt="" />
          </picture>
          <div v-if="message.type == 'question'" class="question-badge">Q</div>
          <div v-if="message.type == 'answer'" class="answer-badge">A</div>
        </div>
        <div v-if="message.quote == null" class="text">
          <UrlToLink :text="message.content" />
        </div>
        <div v-else class="text">
          <button
            class="long-text--button"
            @click.stop="
              // NOTE: 型推論のためにifを追加
              if (message.quote != null) scrolltoMessage(message.quote.id)
            "
          >
            <span class="long-text--content">
              <template v-if="message.type != 'answer'">
                > {{ message.quote.content }}
              </template>
              <template v-else> Q. {{ message.quote.content }} </template>
            </span>
          </button>
          <UrlToLink :text="message.content" />
        </div>
      </div>
      <div class="comment-footer">
        <div class="comment-timestamp">
          {{
            message.status === "loading"
              ? "送信中"
              : showTimestamp(message.timestamp)
          }}
        </div>
        <div class="badges">
          <template v-if="message.status !== 'failure'">
            <button
              v-if="isAdminorSpeaker"
              class="pin-icon"
              :disabled="message.status !== 'success'"
              @click="bookmark()"
            >
              <PinIcon
                :size="18"
                :class="{ selected: isBookMarked }"
                class="icon"
              ></PinIcon>
            </button>
            <button
              class="reply-icon"
              :disabled="message.status !== 'success'"
              @click="clickReply"
            >
              <ReplyIcon :size="20" class="icon"></ReplyIcon>
            </button>
            <button
              class="bg-good-icon"
              :class="{ 'is-liked': isLikedChatItem }"
              :style="{
                backgroundColor: isLikedChatItem ? icon.colorCode : undefined,
              }"
              :disabled="isLikedChatItem || message.status !== 'success'"
              :aria-pressed="isLikedChatItem"
              @click="clickThumbUp"
            >
              <ThumbUpIcon :size="19" class="icon"></ThumbUpIcon>
            </button>
          </template>
          <div v-else class="error-label">
            <AlertCircleIcon
              class="error-icon"
              size="14"
              aria-hidden="true"
            ></AlertCircleIcon>
            <p class="error-message">送信失敗</p>
            <button
              aria-label="リトライ"
              title="リトライ"
              class="retry-button"
              :disabled="isRetrying"
              @click="retrySend"
            >
              <RotateCcwIcon size="14" stroke-width="2.5px"></RotateCcwIcon>
            </button>
          </div>
        </div>
      </div>
    </article>
    <!--Reaction Message-->
    <article
      v-else-if="message.type == 'reaction' && message.quote != null"
      :id="message.id"
      class="reaction"
    >
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
        <div
          class="reaction-badge"
          :style="{
            backgroundColor: icon.colorCode,
          }"
        >
          <ThumbUpIcon class="icon" :size="13"></ThumbUpIcon>
        </div>
      </div>
      <button
        class="reaction-link"
        @click="
          // NOTE: 型推論のためにifを追加
          if (message.quote != null) scrolltoMessage(message.quote.id)
        "
      >
        <div class="long-text">
          {{ message.quote.content }}
        </div>
        <ArrowUpLeftIcon class="icon" size="1.2x"></ArrowUpLeftIcon>
      </button>
    </article>
    <!--System Message-->
    <article
      v-if="message.senderType === 'system'"
      :id="message.id"
      class="system_message"
    >
      <UrlToLink :text="message.content" />
    </article>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import {
  ArrowUpLeftIcon,
  AlertCircleIcon,
  RotateCcwIcon,
} from "vue-feather-icons"
import PinIcon from "vue-material-design-icons/Pin.vue"
import ReplyIcon from "vue-material-design-icons/Reply.vue"
import ThumbUpIcon from "vue-material-design-icons/ThumbUp.vue"
import UrlToLink from "@/components/UrlToLink.vue"
import ICONS from "@/utils/icons"
import { ChatItemStore, PinnedChatItemsStore, UserItemStore } from "~/store"
import { ChatItemWithStatus } from "~/store/chatItems"

type DataType = {
  isLikedChatItem: boolean
  isRetrying: boolean
}

export default Vue.extend({
  name: "Message",
  components: {
    UrlToLink,
    ArrowUpLeftIcon,
    PinIcon,
    ReplyIcon,
    ThumbUpIcon,
    AlertCircleIcon,
    RotateCcwIcon,
  },
  props: {
    message: {
      type: Object,
      required: true,
    } as PropOptions<ChatItemWithStatus>,
    topicId: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      isLikedChatItem: false,
      isRetrying: false,
    }
  },
  computed: {
    icon() {
      return ICONS[this.$props.message.iconId] ?? ICONS[0]
    },
    isBookMarked(): boolean {
      return PinnedChatItemsStore.pinnedChatItems.includes(this.message.id)
    },
    isAdminorSpeaker(): boolean {
      return (
        UserItemStore.userItems.isAdmin ||
        UserItemStore.userItems.speakerId === this.topicId
      )
    },
  },
  methods: {
    clickThumbUp() {
      if (!this.isLikedChatItem) this.isLikedChatItem = true
      this.$emit("click-thumb-up", this.message)
    },
    clickReply() {
      this.$emit("click-reply")
    },
    // Reactionから対象のMessageへスクロール
    scrolltoMessage(id: string) {
      const element: HTMLElement | null = document.getElementById(id)
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
        element.classList.add("highlight")
        setTimeout(() => {
          element.classList.remove("highlight")
        }, 0)
      }
    },
    // タイムスタンプを分、秒単位に変換
    showTimestamp(timeStamp?: number): string {
      if (timeStamp == null) {
        return ""
      }
      const timeStampSec = timeStamp / 1000
      const hours = Math.floor(timeStampSec / 3600)
      if (hours > 99) {
        return "99:59:59"
      }
      const minutes = Math.floor((timeStampSec - 3600 * hours) / 60)
      const seconds = Math.floor(timeStampSec - 3600 * hours - 60 * minutes)
      if (hours > 1) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      } else {
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
      }
    },
    bookmark() {
      this.$emit("click-pin")
    },
    async retrySend() {
      this.isRetrying = true
      try {
        await ChatItemStore.retrySendChatItem({ chatItem: this.message })
      } finally {
        this.isRetrying = false
      }
    },
  },
})
</script>
