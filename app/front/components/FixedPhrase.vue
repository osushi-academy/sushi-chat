<template>
  <span class="fixed-phrase">{{ text }}</span>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "FixedPhrase",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
})
</script>
