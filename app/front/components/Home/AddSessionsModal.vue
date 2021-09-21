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
          />
          <label for="new-line">改行で区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--comma">
          <input
            id="comma"
            type="radio"
            name="separator"
            value="comma"
            checked
          />
          <label for="comma">カンマで区切る</label>
        </div>
        <div class="home-add-sessions-modal__separators--blank">
          <input
            id="blank"
            type="radio"
            name="separator"
            value="blank"
            checked
          />
          <label for="blank">空白で区切る</label>
        </div>
      </div>
      <textarea class="home-add-sessions-modal__textarea" />
    </template>
    <template #hide-button class="home-add-sessions-modal__button">OK</template>
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
})
</script>
