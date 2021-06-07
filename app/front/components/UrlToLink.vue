<template>
  <div>
    <span v-for="(content, i) in text.split(/(https?:\/\/[^\s]*)/)" :key="i">
      <span v-if="i % 2 === 0">
        {{ content }}
      </span>
      <a v-else :href="content" target="_blank" @click.stop>
        {{ content }}
      </a>
    </span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'UrlToLink',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
})
</script>
