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
      <!-- eslint-disable-next-line prettier/prettier -->
      <div class="baloon">{{message.target != null? `> ${message.target.content}\n${message.content}`: message.content}}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
      <button @click="clickReply">REPLY</button>
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
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
      <button @click="clickReply">REPLY</button>
    </article>

    <!--Answer Message-->
    <article
      v-else-if="message.type == 'answer'"
      class="comment question"
      :style="{ background: 'red' }"
      @click="clickCard"
    >
      <div class="icon-wrapper">
        <img :src="icon" alt="" />
        <div class="question-badge">A</div>
        <div v-if="message.iconId == 0" class="admin-badge">運 営</div>
      </div>
      <!-- eslint-disable-next-line prettier/prettier -->
      <div class="baloon">{{`Q. ${message.target.content}\nA. ${message.content}`}}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
      <button @click="clickReply">REPLY</button>
    </article>

    <!-- Reaction -->
    <article v-else class="reaction">
      <div class="icon-wrapper">
        <img :src="icon" alt="" />
      </div>
      <span class="material-icons"> thumb_up </span>
      <div class="text">{{ message.target.content }}</div>
    </article>
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
