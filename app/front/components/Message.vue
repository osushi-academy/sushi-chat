<template>
  <div class="chatitem-wrapper">
    <article
      v-if="message.type == 'message' && !message.isQuestion"
      class="comment"
      @click="clickGood"
    >
      <div class="icon-wrapper">
        <img :src="icons[message.iconId].icon" alt="" />
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
        <img :src="icons[message.iconId].icon" alt="" />
        <div class="question-badge">Q</div>
      </div>
      <div class="baloon">{{ message.content }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <article v-if="message.type == 'reaction'" class="reaction">
      <div class="icon-wrapper">
        <img :src="icons[message.iconId].icon" alt="" />
      </div>
      <span class="material-icons"> thumb_up </span>
      <div class="text">{{ message.target.content }}</div>
    </article>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { ChatItemPropType } from '@/models/contents'

// Data型
type DataType = {
  icons: any
}

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
    } as PropOptions<ChatItemPropType>,
  },
  data(): DataType {
    return {
      icons: [
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
      ],
    }
  },
  methods: {
    clickGood() {
      this.$emit('good', this.message)
    },
  },
})
</script>
