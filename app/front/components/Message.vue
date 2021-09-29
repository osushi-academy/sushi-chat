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
            class="long-text"
            @click.stop="
              // NOTE: 型推論のためにifを追加
              if (message.quote != null) scrolltoMessage(message.quote.id)
            "
          >
            <template v-if="message.type != 'answer'">
              > {{ message.quote.content }}
            </template>
            <template v-else> Q. {{ message.quote.content }} </template>
          </button>
          <UrlToLink :text="message.content" />
        </div>
      </div>
      <div class="comment-footer">
        <div class="comment-timestamp">
          {{ showTimestamp(message.timestamp) }}
        </div>
        <div class="badges">
          <button v-if="isAdminorSpeaker" class="pin-icon" @click="bookmark()">
            <PinIcon
              :size="18"
              :class="{ selected: isBookMarked }"
              class="icon"
            ></PinIcon>
          </button>
          <button class="reply-icon" @click="clickReply">
            <ReplyIcon :size="20" class="icon"></ReplyIcon>
          </button>
          <button
            class="bg-good-icon"
            :style="{
              backgroundColor: isLikedChatItem ? icon.colorCode : undefined,
              color: isLikedChatItem ? 'white' : undefined,
              transform: isLikedChatItem ? 'rotate(-20deg)' : undefined,
            }"
            @click="clickThumbUp"
          >
            <ThumbUpIcon :size="19" class="icon"></ThumbUpIcon>
            <!-- <span
              :style="{
                backgroundColor: isLikedChatItem ? icon.colorCode : '',
                color: isLikedChatItem ? 'white' : '',
                transform: isLikedChatItem ? 'rotate(-20deg)' : '',
              }"
              class="material-icons"
              @click="clickThumbUp"
            >
              thumb_up
            </span> -->
          </button>
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
import { ChatItemModel } from "sushi-chat-shared"
import { ArrowUpLeftIcon } from "vue-feather-icons"
import PinIcon from "vue-material-design-icons/Pin.vue"
import ReplyIcon from "vue-material-design-icons/Reply.vue"
import ThumbUpIcon from "vue-material-design-icons/ThumbUp.vue"
import UrlToLink from "@/components/UrlToLink.vue"
import ICONS from "@/utils/icons"
import { PinnedChatItemsStore, UserItemStore } from "~/store"

type DataType = {
  isLikedChatItem: boolean
  // isBookMarked: boolean
}

export default Vue.extend({
  name: "Message",
  components: {
    UrlToLink,
    ArrowUpLeftIcon,
    PinIcon,
    ReplyIcon,
    ThumbUpIcon,
  },
  props: {
    message: {
      type: Object,
      required: true,
    } as PropOptions<ChatItemModel>,
    topicId: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      isLikedChatItem: false,
      // isBookMarked: false,
    }
  },
  computed: {
    icon() {
      return ICONS[this.$props.message.iconId] ?? ICONS[0]
    },
    pinnedChatItems() {
      return PinnedChatItemsStore.pinnedChatItems
    },
    isBookMarked(): boolean {
      return this.pinnedChatItems.includes(this.message.id)
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
        console.log(id)
        element.classList.add("highlight")
        setTimeout(() => {
          element.classList.remove("highlight")
        }, 0)
      }
    },
    // タイムスタンプを分、秒単位に変換
    showTimestamp(timeStamp?: number): string {
      let sec: number = Math.floor((timeStamp as number) / 1000)
      const min: number = Math.floor(sec / 60)
      sec %= 60
      if (sec < 10) {
        return `${min}` + ":0" + `${sec}`
      } else {
        return `${min}` + ":" + `${sec}`
      }
    },
    bookmark() {
      this.$emit("click-pin")
    },
  },
})
</script>
