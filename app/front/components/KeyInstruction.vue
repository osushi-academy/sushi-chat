<template>
  <div v-if="device != 'smartphone'" class="key-instruct">
    <span v-if="device === 'mac'" class="key-span">⌘</span>
    <span v-if="device === 'windows'" class="key-span">Ctrl</span>
    +<span class="key-span">ENTER</span>で送信
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { DeviceStore } from "~/store"

export default Vue.extend({
  name: "KeyInstruction",
  computed: {
    device() {
      return DeviceStore.device
    },
  },
})
</script>
