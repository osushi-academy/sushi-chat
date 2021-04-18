<template>
  <div class="container page">
    <article class="topic-block">
        <div class="topic-header">
            <div class="main-line">
                <h1 class="title">
                    1. 量子力学セミナー
                </h1>
                <button class="next-button" role="nav">
                    <span class="material-icons">
                        arrow_forward
                    </span>
                </button>
            </div>
        </div>
        <div class="chat-area">
            <div class="text-zone">
                <div class="scrollable">
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                画像処理どうなってんの→独自実装!!?????
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                デザイン期間中に作ったのか！
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご！
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment question">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_ebi.png" alt="">
                                <div class="question-badge">Q</div>
                            </div>
                            <div class="baloon">
                                バックエンドはどんな技術を使ったんですか？
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_kai_hokkigai.png" alt="">
                            </div>
                            <div class="baloon">
                                チーム名の圧がすごいwwwwwwwwwww
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_uni2.png" alt="">
                            </div>
                            <div class="baloon">
                                なんか始まった笑笑
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_uni2.png" alt="">
                            </div>
                            <div class="baloon">
                                既存のモデルそのままじゃなく独自改良してるのいいね
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                チーム名からのフリとオチ面白い笑笑
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="reaction">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_ikura.png" alt="">
                            </div>
                            <span class="material-icons">
                                thumb_up
                            </span>
                            <div class="text">
                                なんか始まった笑笑
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="reaction">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_harasu.png" alt="">
                            </div>
                            <span class="material-icons">
                                thumb_up
                            </span>
                            <div class="text">
                                チーム名の圧がすごいwwwwwwwwwww
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_akami.png" alt="">
                            </div>
                            <div class="baloon">
                                UIきれい!
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
            <div class="stamp-zone">
                <button class="stamp-submit-button">
                    <span class="material-icons">
                        favorite
                    </span>
                </button>
            </div>
        </div>
        <section class="input-area" role="form">
            <div class="main-line">
                <div class="textarea" contenteditable placeholder="コメントを入力して盛り上げよう!!"></div>
                <button class="submit-button">
                    <span class="material-icons">
                        send
                    </span>
                </button>
            </div>
            <div class="key-instruct">
                <span class="key-span">ENTER</span>で改行、<span class="key-span">SHIFT</span>+<span
                    class="key-span">ENTER</span>で送信
            </div>
            <label class="question-checkbox">
                <input type="checkbox">質問として投稿する</input>
            </label>
        </section>
    </article>

    <article class="topic-block">
        <div class="topic-header">
            <div class="main-line">
                <h1 class="title">
                    2. めだまやき
                </h1>
                <button class="next-button" role="navigation">
                    <span class="material-icons">
                        arrow_forward
                    </span>
                </button>
            </div>
        </div>
        <div class="chat-area">
            <div class="text-zone">
                <div class="scrollable">
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                画像処理どうなってんの→独自実装!!?????
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment already-good">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                デザイン期間中に作ったのか！
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                背景切り抜きまでしてくれるんか、すごいな。画像処理を独自実装...!すご！すご
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment question">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_ebi.png" alt="">
                                <div class="question-badge">Q</div>
                            </div>
                            <div class="baloon">
                                バックエンドはどんな技術を使ったんですか？
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_kai_hokkigai.png" alt="">
                            </div>
                            <div class="baloon">
                                チーム名の圧がすごいwwwwwwwwwww
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_uni2.png" alt="">
                            </div>
                            <div class="baloon">
                                なんか始まった笑笑
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_uni2.png" alt="">
                            </div>
                            <div class="baloon">
                                既存のモデルそのままじゃなく独自改良してるのいいね
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_salmon.png" alt="">
                            </div>
                            <div class="baloon">
                                チーム名からのフリとオチ面白い笑笑
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="reaction">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_ikura.png" alt="">
                            </div>
                            <span class="material-icons">
                                thumb_up
                            </span>
                            <div class="text">
                                なんか始まった笑笑
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="reaction">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_harasu.png" alt="">
                            </div>
                            <span class="material-icons">
                                thumb_up
                            </span>
                            <div class="text">
                                チーム名の圧がすごいwwwwwwwwwww
                            </div>
                        </article>
                    </div>
                    <div class="chatitem-wrapper">
                        <article class="comment">
                            <div class="icon-wrapper">
                                <img src="@/assets/img/sushi_akami.png" alt="">
                            </div>
                            <div class="baloon">
                                UIきれい!
                            </div>
                            <div class="bg-good-icon">
                                <span class="material-icons">
                                    thumb_up
                                </span>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
            <div class="stamp-zone">
                <button class="stamp-submit-button">
                    <span class="material-icons">
                        favorite
                    </span>
                </button>
            </div>
            <button class="message-badge">
                最新のコメント
                <div class="material-icons">
                    arrow_downward
                </div>
            </button>
        </div>
        <section class="input-area" role="form">
            <div class="main-line">
                <div class="textarea" contenteditable placeholder="コメントを入力して盛り上げよう!!"></div>
                <button class="submit-button">
                    <span class="material-icons">
                        send
                    </span>
                    <div class="question-badge">Q</div>
                </button>
            </div>
            <div class="key-instruct">
                <span class="key-span">ENTER</span>で改行、<span class="key-span">SHIFT</span>+<span
                    class="key-span">ENTER</span>で送信
            </div>
            <label class="question-checkbox">
                <input type="checkbox">質問として投稿する</input>
            </label>
        </section>
    </article>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>
