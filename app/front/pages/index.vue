<template>
  <div class="container page">
    <div v-for="topic in topics" :key="topic.id">
      <ChatRoom :topic="topic" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as Model from '@/models/contents'
import ChatRoom from '@/components/ChatRoom.vue'

// Data型
type DataType = {
  topics: Model.Topic[]
  isNotify: boolean
}

export default Vue.extend({
  name: 'Index',
  components: {
    ChatRoom,
  },
  data(): DataType {
    return {
      topics: [
        {
          id: '0',
          title: '量子力学セミナー',
          description: '量子力学の発表',
        },
        {
          id: '1',
          title: 'めだまやき',
          description: 'めだまやきを焼く',
        },
      ],
      isNotify: false,
    }
  },
})
</script>
