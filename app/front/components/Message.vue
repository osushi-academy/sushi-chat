<template>
  <div class="chatitem-wrapper">
    <!--Admin Message-->
    <article
      v-if="message.type == 'message' && message.iconId == '0'"
      class="comment admin"
    >
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
        <div class="admin-badge">運 営</div>
      </div>
      <div class="text">
        <UrlToLink :text="message.content" />
      </div>
      <div class="comment-timestamp">
        {{ showTimestamp(message.timestamp) }}
      </div>
    </article>

    <!-- Message -->
    <article
      v-else-if="message.type == 'message'"
      class="comment"
      @click="clickCard"
    >
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
      </div>
      <div v-if="message.target == null" class="text">
        <UrlToLink :text="message.content" />
      </div>
      <div v-else class="text">
        <span :style="{ color: 'gray', fontSize: '80%' }" @click.stop>
          <UrlToLink :text="`> ` + message.target.content" />
        </span>
        <UrlToLink :text="message.content" />
      </div>
      <div class="comment-timestamp">
        {{ showTimestamp(message.timestamp) }}
      </div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <!--Question Message-->
    <article
      v-else-if="message.type == 'question'"
      class="comment question"
      @click="clickCard"
    >
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
        <div class="question-badge">Q</div>
        <div v-if="message.iconId == '0'" class="admin-badge">運 営</div>
      </div>
      <div class="text">
        <UrlToLink :text="message.content" />
      </div>
      <div class="comment-timestamp">
        {{ showTimestamp(message.timestamp) }}
      </div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <!--Answer Message-->
    <article
      v-else-if="message.type == 'answer'"
      class="comment answer"
      @click="clickCard"
    >
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
        <div class="answer-badge">A</div>
        <div v-if="message.iconId == '0'" class="admin-badge">運 営</div>
      </div>
      <div class="text">
        <span>
          <UrlToLink
            :text="'Q. ' + message.target.content"
            :style="{ color: 'gray', fontSize: '80%' }"
          />
        </span>
        <UrlToLink :text="'A. ' + message.content" />
      </div>
      <div class="comment-timestamp">
        {{ showTimestamp(message.timestamp) }}
      </div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <!--Reaction Message-->
    <article v-else-if="message.type == 'reaction'" class="reaction">
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
      </div>
      <span class="material-icons"> thumb_up </span>
      <div class="long-text">
        {{ message.target.content }}
      </div>
      <div class="comment-timestamp">
        {{ showTimestamp(message.timestamp) }}
      </div>
    </article>
    <!--Reply Badge-->
    <button
      v-if="message.type != 'reaction' && message.iconId != '0'"
      class="reply-icon"
      @click="clickReply"
    >
      <span
        class="material-icons"
        :class="{ 'answer-reply': message.type === 'question' }"
      >
        reply
      </span>
    </button>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import UrlToLink from "@/components/UrlToLink.vue"
import ICONS from "@/utils/icons"
import { ChatItemPropType } from "~/models/contents"

export default Vue.extend({
  name: "Message",
  components: {
    UrlToLink,
  },
  props: {
    message: {
      type: Object,
      required: true,
    } as PropOptions<ChatItemPropType>,
  },
  computed: {
    icon() {
      return ICONS[this.$props.message.iconId] ?? ICONS[0]
    },
  },
  methods: {
    clickCard() {
      this.$emit("click-card", this.message)
    },
    clickReply() {
      this.$emit("click-reply")
    },
    // タイムスタンプを分、秒単位に変換
    showTimestamp(timeStamp: number): string {
      let sec: number = Math.floor(timeStamp / 1000)
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
