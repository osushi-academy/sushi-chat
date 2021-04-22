<template>
  <div class="topic-header">
    <div class="main-line">
      <h1 class="title">{{ title }}</h1>
      <button class="next-button" role="navigation">
        <span class="material-icons"> arrow_forward </span>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'TopicHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
})
</script>
