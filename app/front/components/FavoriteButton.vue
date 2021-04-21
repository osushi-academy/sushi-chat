<template>
  <button class="stamp-submit-button" @click="favorite">
    <span class="material-icons"> favorite </span>
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