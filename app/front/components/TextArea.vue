<template>
  <section class="input-area" role="form">
    <div class="main-line">
      <textarea
        v-model="text"
        :disabled="disabled"
        class="textarea"
        contenteditable
        :placeholder="placeholder"
        @keydown.enter="enterSendMessage"
      />
      <button
        type="submit"
        class="submit-button"
        :disabled="disabled"
        @click="sendMessage"
      >
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
    disabled: {
      type: Boolean,
      required: true,
    },
  },
  data(): DataType {
    return {
      isQuestion: false,
      text: '',
    }
  },
  computed: {
    placeholder(): string {
      return this.$props.disabled
        ? '※ まだコメントはオープンしていません'
        : 'ここにコメントを入力して盛り上げよう 🎉🎉'
    },
  },
  methods: {
    sendMessage() {
      // 空なら何もしないでreturn
      if (!this.text.trim().length) {
        return
      }

      // 文字数制限
      if (this.text.length > maxMessageLength) {
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
    enterSendMessage(e: any) {
      if (e.ctrlKey || e.metaKey) this.sendMessage()
    },
  },
})
// コメント文字数上限
const maxMessageLength = 300
</script>
