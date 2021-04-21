<template>
  <article class="topic-block">
    <TopicHeader :title="topic.id + 1 + '. ' + topic.content" />
    <div class="chat-area">
      <div class="text-zone">
        <div class="scrollable">
          <div v-for="message in messages[topic.id]" :key="message.id">
            <Message :message="message" @good="good" />
          </div>
        </div>
      </div>
      <div class="stamp-zone">
        <FavoriteButton @favorite="favorite" />
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
import FavoriteButton from '@/components/FavoriteButton.vue'
export default {
  components: {
    TopicHeader,
    Message,
    TextArea,
    FavoriteButton,
  },
  props: {
    topic: Object,
  },
  data() {
    return {
      messages: [
        [
          {
            id: 0,
            topic_id: 0,
            type: 'message',
            icon_id: 0,
            content: '画像処理どうなってんの→独自実装!!?????',
            is_question: false,
          },
          {
            id: 1,
            topic_id: 0,
            type: 'message',
            icon_id: 1,
            content:
              '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
            is_question: false,
          },
          {
            id: 2,
            topic_id: 0,
            type: 'message',
            icon_id: 2,
            content: 'デザイン期間中に作ったのか！',
            is_question: false,
          },
          {
            id: 3,
            topic_id: 0,
            type: 'message',
            icon_id: 3,
            content: 'バックエンドはどんな技術を使ったんですか？',
            is_question: true,
          },
          {
            id: 4,
            topic_id: 0,
            type: 'message',
            icon_id: 4,
            content: 'チーム名の圧がすごいwwwwwwwwwww',
            is_question: false,
          },
          {
            id: 5,
            topic_id: 0,
            type: 'message',
            icon_id: 5,
            content: 'なんか始まった笑笑',
            is_question: false,
          },
          {
            id: 6,
            topic_id: 0,
            type: 'message',
            icon_id: 6,
            content: '既存のモデルそのままじゃなく独自改良してるのいいね',
            is_question: false,
          },
          {
            id: 7,
            topic_id: 0,
            type: 'message',
            icon_id: 7,
            content: 'チーム名からのフリとオチ面白い笑笑',
            is_question: false,
          },
          {
            id: 8,
            topic_id: 0,
            type: 'reaction',
            icon_id: 0,
            content: 'なんか始まった笑笑',
            is_question: false,
          },
          {
            id: 9,
            topic_id: 0,
            type: 'reaction',
            icon_id: 1,
            content: 'チーム名の圧がすごいwwwwwwwwwww',
            is_question: false,
          },
          {
            id: 10,
            topic_id: 0,
            type: 'message',
            icon_id: 10,
            content: 'UIきれい!',
            is_question: false,
          },
        ],
        [
          {
            id: 0,
            topic_id: 0,
            type: 'message',
            icon_id: 0,
            content: '画像処理どうなってんの→独自実装!!?????',
            is_question: false,
          },
          {
            id: 1,
            topic_id: 0,
            type: 'message',
            icon_id: 3,
            content: 'バックエンドはどんな技術を使ったんですか？',
            is_question: true,
          },
          {
            id: 2,
            topic_id: 0,
            type: 'message',
            icon_id: 4,
            content: 'チーム名の圧がすごいwwwwwwwwwww',
            is_question: false,
          },
          {
            id: 3,
            topic_id: 0,
            type: 'message',
            icon_id: 6,
            content: '既存のモデルそのままじゃなく独自改良してるのいいね',
            is_question: false,
          },
          {
            id: 4,
            topic_id: 0,
            type: 'reaction',
            icon_id: 1,
            content: 'チーム名の圧がすごいwwwwwwwwwww',
            is_question: false,
          },
        ],
      ],
      is_notify: false,
    }
  },
  methods: {
    good: function (message) {
      // いいねmessage
      let m = {
        id: this.messages[message.topic_id].length,
        topic_id: message.topic_id,
        type: 'reaction',
        icon_id: 0, // ユーザーが選んだicon_id
        content: message.content,
        is_question: false,
      }
      this.messages[message.topic_id].push(m)
      // submit
    },
    favorite: function () {
      console.log('favorite')
    },
  },
}
</script>