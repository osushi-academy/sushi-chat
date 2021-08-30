<template>
  <modal
    class="home-creation-completed-modal"
    name="home-creation-completed-modal"
    adaptive
    :click-to-close="false"
  >
    イベントが作成されました
    <button
      class="home-creation-completed-modal__to-home-button"
      @click="$modal.hide('home-creation-completed-modal')"
    >
      <a href="/home"> マイページに戻る </a>
    </button>
  </modal>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "HomeCreationCompletedModal",
  layout: "home",
})
</script>
