<template>
  <div class="home-create">
    <div>イベントの作成</div>
    <div @click="$modal.show('home-add-sessions-modal')">+セッション作成</div>
    <button
      class="home-create__create-new-event-button"
      @click="$modal.show('home-creation-completed-modal')"
    >
      イベントを作成
    </button>
    <AddSessionsModal />
    <CreationCompletedModal />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VModal from "vue-js-modal"
import AddSessionsModal from "@/components/Home/AddSessionsModal"
import CreationCompletedModal from "@/components/Home/CreationCompletedModal"

Vue.use(VModal)

export default Vue.extend({
  name: "HomeEventCreate",
  components: {
    AddSessionsModal,
    CreationCompletedModal,
  },
  layout: "home",
})
</script>
