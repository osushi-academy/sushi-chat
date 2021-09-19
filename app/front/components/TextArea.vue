<template>
  <section class="input-area" role="form">
    <div class="textarea-header">#{{ topic.id }} {{ topic.title }}</div>
    <div v-if="selectedChatItem" class="reply-bar">
      <span class="reply-type">
        <span v-if="selectedChatItem.type == 'question'" class="answer"
          >回答中</span
        >
        <span v-else class="reply">リプライ中</span>
      </span>
      <div v-if="selectedChatItem.type !== 'reaction'" class="reply-content">
        {{ selectedChatItem.content }}
      </div>
      <div class="material-icons" @click="deselectChatItem">close</div>
    </div>
    <div class="sender-badge-wrapper">
      <span
        v-if="selectedChatItem === null"
        class="sender-badge"
        :class="{
          admin: isAdmin === true,
          presenter: isAdmin === false,
        }"
      >
        from おすしアカデミー
      </span>
    </div>
    <textarea
      v-model="text"
      :disabled="disabled"
      class="textarea"
      contenteditable
      :placeholder="placeholder"
      @keydown.enter="enterSendMessage"
    />
    <div class="error-message">
      <span
        class="text-counter"
        :class="{ over: maxMessageLength < text.length }"
      >
        文字数をオーバーしています ({{ text.length - maxMessageLength }}文字)
      </span>
    </div>
    <div class="textarea-footer">
      <div class="instruction">
        <KeyInstruction />
      </div>
      <label class="question-checkbox">
        <input v-model="isQuestion" type="checkbox" /><span
          >質問として投稿</span
        >
      </label>
      <button
        type="submit"
        class="submit-button"
        :disabled="
          disabled || maxMessageLength < text.length || text.length == 0
        "
        :class="{
          admin: isAdmin,
        }"
        @click="sendMessage"
      >
        <span class="material-icons"> send </span>
        <div v-show="isQuestion" class="question-badge">Q</div>
      </button>
    </div>
  </section>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import { TopicPropType, ChatItemPropType } from "@/models/contents"
import KeyInstruction from "@/components/KeyInstruction.vue"
import { UserItemStore } from "~/store"

// Data型
type DataType = {
  isQuestion: boolean
  text: string
  maxMessageLength: number
}
export default Vue.extend({
  name: "TextArea",
  components: {
    KeyInstruction,
  },
  props: {
    topic: {
      type: Object,
      required: true,
    } as PropOptions<TopicPropType>,
    disabled: {
      type: Boolean,
      required: true,
    },
    selectedChatItem: {
      type: Object,
      default: null,
    } as PropOptions<ChatItemPropType>,
  },
  data(): DataType {
    return {
      isQuestion: false,
      text: "",
      maxMessageLength: 300,
    }
  },
  computed: {
    placeholder(): string {
      return this.$props.disabled
        ? "※ まだコメントはオープンしていません"
        : "ここにコメントを入力して盛り上げよう 🎉🎉"
    },
    isAdmin() {
      return UserItemStore.userItems.isAdmin
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

      // 先頭と末尾の空白、改行を削除しsubmit
      this.$emit("submit", this.text.trim(), this.isQuestion)
      // 入力を空に
      this.text = ""
      // チェックボックスのチェックを外す
      this.isQuestion = false

      // スクロール
      const element: HTMLElement | null = document.getElementById(this.topic.id)
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          left: 0,
          behavior: "smooth",
        })
      }
    },
    enterSendMessage(e: any) {
      if (e.ctrlKey || e.metaKey) this.sendMessage()
    },
    // 選択したアイテム取り消し
    deselectChatItem() {
      this.$emit("deselectChatItem")
    },
  },
})
</script>
