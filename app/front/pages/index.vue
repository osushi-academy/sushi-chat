<template>
  <div class="container page">
    <div v-for="topic in topics" :key="topic">
      <article class="topic-block">
        <TopicHeader :title="topic.id + 1 + '. ' + topic.content" />
        <div class="chat-area">
          <div class="text-zone">
            <div class="scrollable">
              <div v-for="comment in comments" :key="comment">
                <Comment
                  :icon_id="comment.icon_id"
                  :content="comment.content"
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
    </div>
  </div>
</template>

<script>
import TopicHeader from '@/components/TopicHeader.vue'
import Comment from '@/components/Comment.vue'
import TextArea from '@/components/TextArea.vue'

export default {
  components: {
    TopicHeader,
    Comment,
    TextArea,
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
      comments: [
        {
          id: 0,
          icon_id: 0,
          content: '画像処理どうなってんの→独自実装!!?????',
        },
        {
          id: 1,
          icon_id: 1,
          content:
            '背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！',
        },
        {
          id: 2,
          icon_id: 2,
          content: 'デザイン期間中に作ったのか！',
        },
        {
          id: 3,
          icon_id: 3,
          content: 'バックエンドはどんな技術を使ったんですか？',
        },
        {
          id: 4,
          icon_id: 4,
          content: 'チーム名の圧がすごいwwwwwwwwwww',
        },
        {
          id: 5,
          icon_id: 5,
          content: 'なんか始まった笑笑',
        },
        {
          id: 6,
          icon_id: 6,
          content: '既存のモデルそのままじゃなく独自改良してるのいいね',
        },
        {
          id: 7,
          icon_id: 7,
          content: 'チーム名からのフリとオチ面白い笑笑',
        },
        { id: 8, icon_id: 0, content: 'なんか始まった笑笑' },
        {
          id: 9,
          icon_id: 1,
          content: 'チーム名の圧がすごいwwwwwwwwwww',
        },
        {
          id: 10,
          icon_id: 10,
          content: 'UIきれい!',
        },
      ],
      is_notify: false,
    }
  },
}
</script>
