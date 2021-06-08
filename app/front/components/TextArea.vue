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
    <div class="instruction">
      <KeyInstruction :device-type="deviceType" />
      <span
        class="text-counter"
        :class="{ over: maxMessageLength < text.length }"
        >文字数をオーバーしています。 {{ maxMessageLength - text.length }}</span
      >
    </div>
    <label class="question-checkbox">
      <input v-model="isQuestion" type="checkbox" />質問として投稿する
    </label>
  </section>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { TopicPropType, DeviceType } from '@/models/contents'
import KeyInstruction from '@/components/KeyInstruction.vue'

// Data型
type DataType = {
  isQuestion: boolean
  text: string
  maxMessageLength: number
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
    deviceType: {
      type: String,
      default: 'windows',
    } as PropOptions<DeviceType>,
  },
  data(): DataType {
    return {
      isQuestion: false,
      text: '',
      maxMessageLength: 300,
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
      if (this.text.length > this.maxMessageLength) {
        return
      }

      // submit
      this.$emit('submit', this.text, this.isQuestion)
      // 入力を空に
      this.text = ''
      // チェックボックスのチェックを外す
      this.isQuestion = false

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
    enterSendMessage(e: any) {
      if (e.ctrlKey || e.metaKey) this.sendMessage()
    },
  },
})
</script>
