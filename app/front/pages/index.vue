<template>
  <div class="container page">
    <div v-for="topic in topics" :key="topic">
      <ChatRoom :topic="topic" />
    </div>
  </div>
</template>

<script>
import ChatRoom from '@/components/ChatRoom.vue'

export default {
  components: {
    ChatRoom,
  },
  data() {
    return {
      topics: [
        {
          id: 0,
          content: '量子力学セミナー',
          description: '量子力学の発表',
        },
        {
          id: 1,
          content: 'めだまやき',
          description: 'めだまやきを焼く',
        },
      ],
      is_notify: false,
    }
  },
}
</script>
