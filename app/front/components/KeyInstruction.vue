<template>
  <div v-if="deviceType != 'smartphone'" class="key-instruct">
    <span class="key-span">ENTER</span>で改行、
    <span v-if="deviceType === 'mac'" class="key-span">⌘</span>
    <span v-if="deviceType === 'windows'" class="key-span">Ctrl</span>
    +<span class="key-span">ENTER</span>で送信
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { DeviceType } from '@/models/contents'

export default Vue.extend({
  name: 'KeyInstruction',
  props: {
    deviceType: {
      type: String,
      default: 'windows',
    } as PropOptions<DeviceType>,
  },
})
</script>
