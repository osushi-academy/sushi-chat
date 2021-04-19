<template>
  <div class="container page">
    <article class="topic-block">
      <TopicHeader title="1. 量子力学セミナー" />
      <div class="chat-area">
        <div class="text-zone">
          <div class="scrollable">
            <Comment
              iconNum="0"
              text="画像処理どうなってんの→独自実装!!?????"
            />
            <Comment iconNum="1" text="デザイン期間中に作ったのか！" />
            <Comment
              iconNum="2"
              text="背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！"
            />
            <Comment
              iconNum="3"
              text="バックエンドはどんな技術を使ったんですか？"
            />
            <Comment iconNum="4" text="チーム名の圧がすごいwwwwwwwwwww" />
            <Comment iconNum="5" text="なんか始まった笑笑" />
            <Comment
              iconNum="6"
              text="既存のモデルそのままじゃなく独自改良してるのいいね"
            />
            <Comment iconNum="7" text="チーム名からのフリとオチ面白い笑笑" />
            <Comment iconNum="8" text="なんか始まった笑笑" />
            <Comment iconNum="9" text="チーム名の圧がすごいwwwwwwwwwww" />
            <Comment iconNum="10" text="UIきれい!" />
          </div>
        </div>
        <div class="stamp-zone">
          <button class="stamp-submit-button">
            <span class="material-icons"> favorite </span>
          </button>
        </div>
      </div>
      <TextArea />
    </article>

    <article class="topic-block">
      <TopicHeader title="2. めだまやき" />
      <div class="chat-area">
        <div class="text-zone">
          <div class="scrollable">
            <Comment
              iconNum="0"
              text="画像処理どうなってんの→独自実装!!?????"
            />
            <Comment iconNum="1" text="デザイン期間中に作ったのか！" />
            <Comment
              iconNum="2"
              text="背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！"
            />
            <Comment
              iconNum="3"
              text="バックエンドはどんな技術を使ったんですか？"
            />
            <Comment iconNum="4" text="チーム名の圧がすごいwwwwwwwwwww" />
            <Comment iconNum="5" text="なんか始まった笑笑" />
            <Comment
              iconNum="6"
              text="既存のモデルそのままじゃなく独自改良してるのいいね"
            />
            <Comment iconNum="7" text="チーム名からのフリとオチ面白い笑笑" />
            <Comment iconNum="8" text="なんか始まった笑笑" />
            <Comment iconNum="9" text="チーム名の圧がすごいwwwwwwwwwww" />
            <Comment iconNum="10" text="UIきれい!" />
          </div>
        </div>
        <div class="stamp-zone">
          <button class="stamp-submit-button">
            <span class="material-icons"> favorite </span>
          </button>
        </div>
        <button class="message-badge">
          最新のコメント
          <div class="material-icons">arrow_downward</div>
        </button>
      </div>
      <TextArea />
    </article>
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
}
</script>
