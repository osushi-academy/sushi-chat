<template>
  <modal
    classes="home-modal"
    :name="name"
    adaptive
    :width="width"
    height="auto"
    :click-to-close="clickToClose"
  >
    <div class="home-modal__header">
      <slot name="title" />
    </div>
    <div class="home-modal__content">
      <slot name="content" />
    </div>
    <div class="home-modal__footer">
      <button class="home-modal__hide-button" @click="$modal.hide(name)">
        <slot name="hide-button" />
      </button>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from "vue"
import { DeviceStore } from "~/store"

export default Vue.extend({
  name: "HomeAddSessionsModal",
  layout: "home",
  props: {
    name: {
      type: String,
      required: true,
    },
    clickToClose: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    width() {
      if (DeviceStore.device === "smartphone") {
        return "90%"
      } else {
        return "50%"
      }
    },
  },
})
</script>
