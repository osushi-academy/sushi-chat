<template>
  <modal
    classes="home-modal"
    :name="name"
    adaptive
    :width="width"
    height="auto"
    :click-to-close="clickToClose"
    @before-open="beforeOpen"
  >
    <div class="home-modal__header">
      <slot name="title" />
    </div>
    <div class="home-modal__content">
      <slot name="content" />
    </div>
    <div class="home-modal__footer home-modal__hide-button">
      <slot name="hide-button" />
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
        return "100%"
      } else {
        return "50%"
      }
    },
  },
  methods: {
    beforeOpen(event: any) {
      this.$emit("before-open", event)
    },
  },
})
</script>
