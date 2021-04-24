<template>
  <button class="stamp-submit-button" @click="clickFavorite">
    <span class="material-icons"> favorite </span>
    <span v-if="show" >{{show}}</span>
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
      show: true
    }
  },
  methods: {
    clickFavorite() {
      this.show != this.show;
      this.$emit('favorite');
    },
  },
})
</script>
