<template>
  <button class="stamp-submit-button">
    <span class="material-icons" @click="favorite"> favorite </span>
  </button>
</template>
<script>
export default {
  methods: {
    favorite: function () {
      this.$emit('favorite')
    },
  },
}
</script>