<template>
  <div class="chatitem-wrapper">
    <!-- Message -->
    <article
      v-if="message.type != 'reaction'"
      class="comment"
      :class="{
        admin: message.iconId == '0',
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
          v-if="message.type == 'question' || message.target == null"
          class="text"
        >
          <UrlToLink :text="message.content" />
        </div>
        <div v-else class="text">
          <span :style="{ color: 'gray', fontSize: '80%' }" @click.stop>
            <UrlToLink :text="`> ` + message.target.content" />
          </span>
          <UrlToLink :text="message.content" />
        </div>
      </div>
      <div class="comment-footer">
        <div class="comment-timestamp">
          {{ showTimestamp(message.timestamp) }}
        </div>
        <div v-if="message.iconId != '0'" class="badges">
          <button class="reply-icon" @click="clickReply">
            <span class="material-icons"> reply </span>
          </button>
          <button class="bg-good-icon">
            <span class="material-icons" @click="clickCard"> thumb_up </span>
          </button>
        </div>
      </div>
    </article>

    <!--Reaction Message-->
    <article v-else-if="message.type == 'reaction'" class="reaction">
      <div class="icon-wrapper">
        <picture>
          <source :srcset="icon.webp" type="image/webp" />
          <img :src="icon.png" alt="" />
        </picture>
        <div class="raction-badge">
          <span class="material-icons"> thumb_up </span>
        </div>
      </div>
      <div class="long-text">
        {{ message.target.content }}
      </div>
      <span class="material-icons"> north_west </span>
    </article>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from "vue"
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
        return String(min) + ":0" + String(sec)
      } else {
        return String(min) + ":" + String(sec)
      }
    },
  },
})
</script>
