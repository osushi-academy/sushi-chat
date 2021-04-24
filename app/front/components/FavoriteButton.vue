<template>
  <button class="stamp-submit-button" @click="clickFavorite">
    <span class="material-icons"> favorite </span>
    <transition name="heart-button-animation">
      <span v-if="show" class="heart-button"></span>
    </transition>
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
      this.show =!this.show;
      this.$emit('favorite');
    },
  },
})
</script>
