<template>
  <div class="topic-header" :class="topicBackgroundColor(isActiveTopic)">
    <div class="main-line">
      <h1 class="title">{{ title }}</h1>
      <button v-if="isAdmin" class="next-button" role="navigation">
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
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActiveTopic: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    topicBackgroundColor(flag: Boolean): String {
      if (flag) {
        return 'active-topic'
      } else {
        return ''
      }
    },
  },
})
</script>
