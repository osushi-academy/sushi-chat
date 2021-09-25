<template>
  <div class="chatitem-wrapper">
    <!-- Message -->
    <article
      v-if="message.type != 'reaction'"
      :id="messageId"
      class="comment"
      :class="{
        admin: message.iconId == 0,
        question: message.type == 'question',
        answer: message.type == 'answer',
      }"
    >
      <div class="sender-badge">from おすしアカデミー</div>
      <div class="main-contents">
        <div class="icon-wrapper">
          <picture>
            <source :srcset="icon.webp" type="image/webp" />
            <img :src="icon.png" alt="" />
          </picture>
          <div v-if="message.type == 'question'" class="question-badge">Q</div>
          <div v-if="message.type == 'answer'" class="answer-badge">A</div>
        </div>
        <div
          v-if="message.type == 'question' || message.quote == null"
          class="text"
        >
          <UrlToLink :text="message.content" />
        </div>
        <div v-else class="text">
          <span
            class="long-text"
            :style="{ color: 'gray', fontSize: '80%' }"
            @click.stop
          >
            <UrlToLink
              v-if="message.type != 'answer'"
              :text="`> ` + message.quote.content"
            />
            <UrlToLink v-else :text="`Q. ` + message.quote.content" />
          </span>
          <UrlToLink :text="message.content" />
        </div>
      </div>
      <div class="comment-footer">
        <div class="comment-timestamp">
          {{ showTimestamp(message.timestamp) }}
        </div>
        <div class="badges">
          <button class="reply-icon" @click="clickReply">
            <span class="material-icons"> reply </span>
          </button>
          <button class="bg-good-icon">
            <span
              :style="{
                backgroundColor: isLikedChatItem ? icon.colorCode : '',
                color: isLikedChatItem ? 'white' : '',
                transform: isLikedChatItem ? 'rotate(-20deg)' : '',
              }"
              class="material-icons"
              @click="clickThumbUp"
            >
              thumb_up
            </span>
          </button>
        </div>
      </div>
    </article>

    <!--Reaction Message-->
    <article
      v-else-if="message.type == 'reaction'"
      :id="messageId"
      class="reaction"
    >
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
        <div
          class="material-icons raction-badge"
          :style="{
            backgroundColor: icon.colorCode,
          }"
        >
          thumb_up
        </div>
      </div>
      <div class="long-text">
        {{ message.quote.content }}
      </div>
      <!-- quoteのmessageにスクロール -->
      <span class="material-icons" @click="scrolltoMessage(message.quote.id)">
        north_west
      </span>
    </article>
    <!--System Message-->
    <!--article class="system_message" :id="messageId">
      <UrlToLink :text="message.content" />
    </article-->
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import { ChatItemModel } from "sushi-chat-shared"
import UrlToLink from "@/components/UrlToLink.vue"
import ICONS from "@/utils/icons"

type DataType = {
  isLikedChatItem: boolean
}

export default Vue.extend({
  name: "Message",
  components: {
    UrlToLink,
  },
  props: {
    message: {
      type: Object,
      required: true,
    } as PropOptions<ChatItemModel>,
    messageId: {
      type: String,
      required: true,
    },
    topicId: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      isLikedChatItem: false,
    }
  },
  computed: {
    icon() {
      return ICONS[this.$props.message.iconId] ?? ICONS[0]
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
  },
})
</script>
