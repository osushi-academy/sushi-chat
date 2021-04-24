<template>
  <section class="input-area" role="form">
    <div class="main-line">
      <textarea
        v-model="text"
        class="textarea"
        contenteditable
        placeholder="コメントを入力して盛り上げよう!!"
        @keydown.enter.meta.exact="sendMessage"
      />
      <button type="submit" class="submit-button" @click="sendMessage">
        <span class="material-icons"> send </span>
        <div v-show="isQuestion" class="question-badge">Q</div>
      </button>
    </div>
    <KeyInstruction />
    <label class="question-checkbox">
      <input type="checkbox" @click="setQuestion" />質問として投稿する
    </label>
  </section>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { TopicPropType } from '@/models/contents'
import KeyInstruction from '@/components/KeyInstruction.vue'

// Data型
type DataType = {
  isQuestion: boolean
  text: string
}
export default Vue.extend({
  name: 'TextArea',
  components: {
    KeyInstruction,
  },
  props: {
    topic: {
      type: Object,
      required: true,
    } as PropOptions<TopicPropType>,
    myIcon: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      isQuestion: false,
      text: '',
    }
  },
  methods: {
    sendMessage() {
      // 空なら何もしないでreturn
      if (!this.text.length) {
        return
      }
      // submit
      this.$emit('submit', this.text, this.isQuestion)
      // 入力を空に
      this.text = ''

      // スクロール
      const element: HTMLElement | null = document.getElementById(this.topic.id)
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: 'smooth',
        })
      }
    },
    // 質問フラグを立てる
    setQuestion() {
      this.isQuestion = !this.isQuestion
    },
  },
})
</script>
