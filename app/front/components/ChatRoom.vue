<template>
  <article class="topic-block">
    <TopicHeader :title="topic.id + 1 + '. ' + topic.content" />
    <div class="chat-area">
      <div class="text-zone">
        <div class="scrollable">
          <div v-for="message in messages" :key="message">
            <Message
              :icon_id="message.icon_id"
              :content="message.content"
              :type="message.type"
            />
          </div>
        </div>
      </div>
      <div class="stamp-zone">
        <button class="stamp-submit-button">
          <span class="material-icons"> favorite </span>
        </button>
      </div>
      <button class="message-badge" v-show="is_notify">
        最新のコメント
        <div class="material-icons">arrow_downward</div>
      </button>
    </div>
    <TextArea />
  </article>
</template>
<script>
import TopicHeader from '@/components/TopicHeader.vue'
import Message from '@/components/Message.vue'
import TextArea from '@/components/TextArea.vue'
export default {
  components: {
    TopicHeader,
    Message,
    TextArea,
  },
  props: {
    topic: Object,
  },
  data() {
    return {
      messages: [
        {
          id: 0,
          topic_id: 0,
          type: 'message',
          icon_id: 0,
          content: '画像処理どうなってんの→独自実装!!?????',
        },
        {
          id: 1,
          topic_id: 0,
          type: 'message',
          icon_id: 1,
          content:
            '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
        },
        {
          id: 2,
          topic_id: 0,
          type: 'message',
          icon_id: 2,
          content: 'デザイン期間中に作ったのか！',
        },
        {
          id: 3,
          topic_id: 0,
          type: 'message',
          icon_id: 3,
          content: 'バックエンドはどんな技術を使ったんですか？',
        },
        {
          id: 4,
          topic_id: 0,
          type: 'message',
          icon_id: 4,
          content: 'チーム名の圧がすごいwwwwwwwwwww',
        },
        {
          id: 5,
          topic_id: 0,
          type: 'message',
          icon_id: 5,
          content: 'なんか始まった笑笑',
        },
        {
          id: 6,
          topic_id: 0,
          type: 'message',
          icon_id: 6,
          content: '既存のモデルそのままじゃなく独自改良してるのいいね',
        },
        {
          id: 7,
          topic_id: 0,
          type: 'message',
          icon_id: 7,
          content: 'チーム名からのフリとオチ面白い笑笑',
        },
        {
          id: 8,
          topic_id: 0,
          type: 'reaction',
          icon_id: 0,
          content: 'なんか始まった笑笑',
        },
        {
          id: 9,
          topic_id: 0,
          type: 'reaction',
          icon_id: 1,
          content: 'チーム名の圧がすごいwwwwwwwwwww',
        },
        {
          id: 10,
          topic_id: 0,
          type: 'message',
          icon_id: 10,
          content: 'UIきれい!',
        },
      ],
    }
  },
}
</script>