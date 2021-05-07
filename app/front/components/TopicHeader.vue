<template>
  <div
    class="topic-header"
    :class="{
      'finished-topic': isFinishedTopic,
      'active-topic': isActiveTopic,
    }"
  >
    <div class="main-line">
      <h1 class="title">{{ title }}</h1>
      <button class="next-button" role="navigation" @click="clickDownload">
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
    isActiveTopic: {
      type: Boolean,
      required: true,
    },
    isFinishedTopic: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    clickTopicActivate() {
      this.$emit('topic-activate')
    },
    clickDownload() {
      this.$emit('download')
    }
  },
})
</script>
