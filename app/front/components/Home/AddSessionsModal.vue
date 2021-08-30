<template>
  <modal
    class="home-add-sessions-modal"
    name="home-add-sessions-modal"
    adaptive
  >
    セッション名を入力してください
    <button
      class="home-add-sessions-modal__completed-button"
      @click="$modal.hide('home-add-sessions-modal')"
    >
      OK
    </button>
  </modal>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "HomeAddSessionsModal",
  layout: "home",
})
</script>
