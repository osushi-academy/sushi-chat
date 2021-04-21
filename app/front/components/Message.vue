<template>
  <div class="chatitem-wrapper">
    <article
      v-if="message.type == 'message' && !message.is_question"
      class="comment"
      @click="good"
    >
      <div class="icon-wrapper">
        <img :src="icons[message.icon_id].icon" alt="" />
      </div>
      <div class="baloon">{{ message.content }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <article
      v-if="message.type == 'message' && message.is_question"
      class="comment question"
      @click="good"
    >
      <div class="icon-wrapper">
        <img :src="icons[message.icon_id].icon" alt="" />
        <div class="question-badge">Q</div>
      </div>
      <div class="baloon">{{ message.content }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>

    <article v-if="message.type == 'reaction'" class="reaction">
      <div class="icon-wrapper">
        <img :src="icons[message.icon_id].icon" alt="" />
      </div>
      <span class="material-icons"> thumb_up </span>
      <div class="text">{{ message.content }}</div>
    </article>
  </div>
</template>
<script>
export default {
  props: {
    message: {
      type: Object,
      default: () => ({
        id: 0,
        topic_id: 0,
        type: 'message',
        icon_id: 0,
        content: '画像処理どうなってんの→独自実装!!?????',
        is_question: false,
      }),
    },
  },
  data() {
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
        { icon: require('@/assets/img/sushi_syari.png') },
        { icon: require('@/assets/img/sushi_tai.png') },
        { icon: require('@/assets/img/sushi_uni.png') },
      ],
    }
  },
  methods: {
    good: function () {
      this.$emit('good', this.message)
    },
  },
}
</script>
