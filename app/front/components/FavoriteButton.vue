<template>
  <button class="stamp-submit-button heart-button" @click="clickFavorite">
    <span class="material-icons"> favorite </span>
  </button>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  methods: {
    clickFavorite() {
      this.$emit('favorite')
    },
  },
})
</script>
