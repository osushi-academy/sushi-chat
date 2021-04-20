<template>
  <section class="input-area" role="form">
    <div class="main-line">
      <div
        class="textarea"
        contenteditable
        placeholder="コメントを入力して盛り上げよう!!"
      ></div>
      <button class="submit-button">
        <span class="material-icons"> send </span>
        <div class="question-badge" v-show="is_question">Q</div>
      </button>
    </div>
    <KeyInstruction />
    <label class="question-checkbox">
      <input type="checkbox" @click="questionFlag" />質問として投稿する
    </label>
  </section>
</template>
<script>
import KeyInstruction from '@/components/KeyInstruction.vue'

export default {
  components: {
    KeyInstruction,
  },
  data() {
    return {
      is_question: false,
    }
  },
  methods: {
    questionFlag: function () {
      this.is_question = !this.is_question
    },
  },
}
</script>