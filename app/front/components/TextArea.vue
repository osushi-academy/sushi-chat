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
import * as Model from '@/models/contents'
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
    } as PropOptions<Model.TopicPropType>,
  },
  data(): DataType {
    return {
      isQuestion: false,
      text: '',
    }
  },
  methods: {
    getId(): string {
      return Math.random().toString(36).slice(-8)
    },
    async sendMessage() {
      // 空なら何もしないでreturn
      if (!this.text.length) {
        return
      }
      // 新規message
      const m: Model.Message = {
        id: `${this.getId()}`,
        topicId: this.topic.id,
        type: 'message',
        iconId: '0',
        content: this.text,
        timestamp: 1100,
        isQuestion: this.isQuestion,
      }
      // 入力を空に
      this.text = ''
      // submit
      await this.$emit('submit', m)

      // スクロール
      const element: HTMLElement | null = document.getElementById(this.topic.id)
      if (element) {
        element.scrollTo(0, 10000)
      }
    },
    setQuestion() {
      this.isQuestion = !this.isQuestion
    },
  },
})
</script>
