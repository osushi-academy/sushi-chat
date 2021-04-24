<template>
  <button class="stamp-submit-button" @click="clickFavorite">
    <span class="material-icons"> favorite </span>
    <span v-if="show" class="heart-button"></span>
  </button>
</template>
<script lang="ts">
import Vue from 'vue'
export type DataType = {
  show: boolean
}

export default Vue.extend({
  data():DataType {
    return {
      show: false,
    }
  },
  methods: {
    clickFavorite() {
      this.show =! this.show
      this.$emit('favorite')
    },
  },
})
</script>
