<template>
  <Modal name="home-add-sessions-modal" class="home-add-sessions-modal">
    <template #title>セッション名を入力してください</template>
    <template #content>
      <div class="home-add-sessions-modal__separators">
        <div class="home-add-sessions-modal__separators--new-line">
          <input
            id="new-line"
            type="radio"
            name="separator"
            value="new-line"
            checked
            @click="separator[0].checked = true"
          />
          <label for="new-line">改行で区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--comma">
          <input
            id="comma"
            type="radio"
            name="separator"
            value="comma"
            @click="separator[1].checked = true"
          />
          <label for="comma">カンマで区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--blank">
          <input
            id="blank"
            type="radio"
            name="separator"
            value="blank"
            @click="separator[2].checked = true"
          />
          <label for="blank">空白で区切る</label>
        </div>
      </div>
      <textarea
        :value="text"
        class="home-add-sessions-modal__textarea"
        @input="$emit('input', $event.target.value)"
      />
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
  data(): any {
    return {
      separator: document.getElementsByName("separator"),
    }
  },
  methods: {
    // 選択されている分割方法を返す
    separateTopics() {
      let option = ""

      for (let i = 0; i < 3; i++) {
        if (this.separator.item(i).checked) {
          option = this.separator.item(i).value
        }
      }
      this.$emit("separate-topics", option)
    },
  },
})
</script>
