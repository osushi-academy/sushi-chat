<template>
  <div class="chatitem-wrapper">
    <!--Admin Message-->
    <article
      v-if="message.type == 'message' && message.iconId == 0"
      class="comment admin"
    >
      <div class="icon-wrapper">
        <img :src="icon" alt="" />
        <div class="admin-badge">運 営</div>
      </div>
      <div class="baloon">{{ message.content }}</div>
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
        <img :src="icon" alt="" />
      </div>
      <div class="baloon">
        <!-- eslint-disable-next-line prettier/prettier -->
        <div v-if="message.target == null" class="baloon">{{ message.content }}
        </div>
        <div v-else class="baloon">
          <span :style="{ color: 'gray', fontSize: '80%' }"
            >> {{ message.target.content }}</span
          >
          {{ message.content }}
        </div>
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
        <img :src="icon" alt="" />
        <div class="question-badge">Q</div>
        <div v-if="message.iconId == 0" class="admin-badge">運 営</div>
      </div>
      <div class="baloon">{{ message.content }}</div>
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
        <img :src="icon" alt="" />
        <div class="answer-badge">A</div>
        <div v-if="message.iconId == 0" class="admin-badge">運 営</div>
      </div>
      <!-- eslint-disable-next-line prettier/prettier -->
      <div class="baloon">{{`Q. ${message.target.content}\nA. ${message.content}`}}</div>
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
        <img :src="icon" alt="" />
      </div>
      <span class="material-icons"> thumb_up </span>
      <div class="text">{{ message.target.content | reactionTargetText }}</div>
      <div class="comment-timestamp">
        {{ showTimestamp(message.timestamp) }}
      </div>
    </article>
    <!--Reply Badge-->
    <div
      v-if="message.type != 'reaction' && message.iconId != 0"
      class="reply-icon"
      @click="clickReply"
    >
      <span
        class="material-icons"
        :class="{ 'answer-reply': message.type === 'question' }"
      >
        reply
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { ChatItem } from '~/models/contents'

// PropのChatItemの型（今回はChatItemをそのまま）
export type ChatItemPropType = ChatItem

export default Vue.extend({
  name: 'Message',
  props: {
    message: {
      type: Object,
      required: true,
    } as PropOptions<ChatItemPropType>,
  },
  filters: {
    reactionTargetText(text: string) {
      const maxText = 20
      return text.length > maxText ? text.slice(0, maxText) + '...' : text
    },
  },
  computed: {
    icon(): { icon: unknown } {
      return ICONS[this.$props.message.iconId]?.icon ?? ICONS[0].icon
    },
  },
  methods: {
    clickCard() {
      this.$emit('click-card', this.message)
    },
    clickReply() {
      this.$emit('click-reply')
    },
    // タイムスタンプを分、秒単位に変換
    showTimestamp(timeStamp: number): string {
      let sec: number = Math.floor(timeStamp / 1000)
      const min: number = Math.floor(sec / 60)
      sec %= 60
      if (sec < 10) {
        return String(min) + ':0' + String(sec)
      } else {
        return String(min) + ':' + String(sec)
      }
    },
  },
})

const ICONS = [
  { icon: require('@/assets/img/tea.png') },
  { icon: require('@/assets/img/sushi_akami.png') },
  { icon: require('@/assets/img/sushi_ebi.png') },
  { icon: require('@/assets/img/sushi_harasu.png') },
  { icon: require('@/assets/img/sushi_ikura.png') },
  { icon: require('@/assets/img/sushi_iwashi.png') },
  { icon: require('@/assets/img/sushi_kai_hokkigai.png') },
  { icon: require('@/assets/img/sushi_salmon.png') },
  { icon: require('@/assets/img/sushi_shirasu.png') },
  { icon: require('@/assets/img/sushi_tai.png') },
  { icon: require('@/assets/img/sushi_uni.png') },
  { icon: require('@/assets/img/sushi_syari.png') },
]
</script>
