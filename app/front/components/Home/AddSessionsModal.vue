<template>
  <Modal name="home-add-sessions-modal" class="home-add-sessions-modal">
    <template #title>セッション名を入力してください</template>
    <template #content>
      <div class="home-add-sessions-modal__separators">
        <div class="home-add-sessions-modal__separators--new-line">
          <input
            id="new-line"
            v-model="newline"
            type="checkbox"
            name="separator"
            value="new-line"
          />
          <label for="new-line">改行で区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--comma">
          <input
            id="comma"
            v-model="comma"
            type="checkbox"
            name="separator"
            value="comma"
          />
          <label for="comma">カンマで区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--blank">
          <input
            id="blank"
            v-model="space"
            type="checkbox"
            name="separator"
            value="blank"
          />
          <label for="blank">空白で区切る</label>
        </div>
      </div>
      <textarea v-model="text" class="home-add-sessions-modal__textarea" />
      <div class="home-add-sessions-modal__count">
        入力件数：{{ topicCount }}件
      </div>
    </template>
    <template #hide-button>
      <button
        class="home-add-sessions-modal__button home-modal__hide-button"
        @click="separateTopics"
      >
        OK
      </button>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "@/components/Home/Modal.vue"

type Data = {
  text: string
  newline: boolean
  comma: boolean
  space: boolean
}

export default Vue.extend({
  name: "HomeAddSessionsModal",
  components: {
    Modal,
  },
  layout: "home",
  data(): Data {
    return {
      // separator: document.getElementsByName("separator"),
      text: "",
      newline: true,
      comma: false,
      space: false,
    }
  },
  computed: {
    topicCount(): number {
      return this.text.split(
        new RegExp(
          `[${this.newline ? "\n" : ""}${this.comma ? "," : ""}${
            this.space ? "\\s" : ""
          }]+`,
          "g",
        ),
      ).length
    },
  },
  methods: {
    // 選択されている分割方法を返す
    separateTopics() {
      const topicTitles = this.text.split(
        new RegExp(
          `[${this.newline ? "\n" : ""}${this.comma ? "," : ""}${
            this.space ? "\\s" : ""
          }]+`,
          "g",
        ),
      )

      this.$emit("separate-topics", topicTitles)
    },
  },
})
</script>
