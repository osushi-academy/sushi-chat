<template>
  <Modal name="home-add-sessions-modal" class="home-add-sessions-modal">
    <template #title>セッション名を入力してください</template>
    <template #content>
      <div class="home-add-sessions-modal__separators">
        <div class="home-add-sessions-modal__separators--new-line">
          <input id="new-line" type="radio" name="separator" value="new-line" />
          <label for="new-line">改行で区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--comma">
          <input id="comma" type="radio" name="separator" value="comma" />
          <label for="comma">カンマで区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--blank">
          <input id="blank" type="radio" name="separator" value="blank" />
          <label for="blank">空白で区切る</label>
        </div>
      </div>
      <textarea
        :value="text"
        class="home-add-sessions-modal__textarea"
        @input="$emit('input', $event)"
      />
    </template>
    <template #hide-button class="home-add-sessions-modal__button">
      <button @click="separateTopics">OK</button>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from "vue"
import Modal from "@/components/Home/Modal.vue"

export default Vue.extend({
  name: "HomeAddSessionsModal",
  components: {
    Modal,
  },
  layout: "home",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  methods: {
    // 選択されている分割方法を返す
    separateTopics() {
      const separator = document.getElementsByName("separator")
      const option = ""

      // for (let i = 0; i < 3; i++) {
      //   if (separator.item(i).checked) {
      //     option = separator.item(i).value
      //   }
      // }
      this.$emit("separate-topics", option)
    },
  },
})
</script>
