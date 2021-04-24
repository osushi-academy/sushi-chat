<template>
  <div class="chatitem-wrapper">
    <article
      v-if="message.type == 'message' && !message.isQuestion"
      class="comment"
      @click="clickGood"
    >
      <div class="icon-wrapper">
        <img :src="icon" alt="" />
      </div>
      <div class="baloon">{{ message.content }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <article
      v-if="message.type == 'message' && message.isQuestion"
      class="comment question"
      @click="clickGood"
    >
      <div class="icon-wrapper">
        <img :src="icon" alt="" />
        <div class="question-badge">Q</div>
      </div>
      <div class="baloon">{{ message.content }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <article v-if="message.type == 'reaction'" class="reaction">
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
import * as Model from '@/models/contents'

export default Vue.extend({
  name: 'Message',
  props: {
    message: {
      type: Object,
      required: true,
      default: () => ({
        id: '0',
        topicId: '0',
        type: 'message',
        iconId: '0',
        content: '画像処理どうなってんの→独自実装!!?????',
        isQuestion: false,
        timestamp: 100,
      }),
    } as PropOptions<Model.ChatItemPropType>,
  },
  computed: {
    icon(): { icon: unknown } {
      return ICONS[this.$props.message.iconId]?.icon ?? ICONS[0].icon
    },
  },
  methods: {
    clickGood() {
      this.$emit('good', this.message)
    },
  },
})

const ICONS = [
  { icon: require('@/assets/img/sushi_akami.png') },
  { icon: require('@/assets/img/sushi_ebi.png') },
  { icon: require('@/assets/img/sushi_harasu.png') },
  { icon: require('@/assets/img/sushi_ikura.png') },
  { icon: require('@/assets/img/sushi_iwashi.png') },
  { icon: require('@/assets/img/sushi_kai_hokkigai.png') },
  { icon: require('@/assets/img/sushi_salmon.png') },
  { icon: require('@/assets/img/sushi_shirasu.png') },
  { icon: require('@/assets/img/sushi_syari.png') },
  { icon: require('@/assets/img/sushi_tai.png') },
  { icon: require('@/assets/img/sushi_uni.png') },
]
</script>
