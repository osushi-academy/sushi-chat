<template>
  <div class="sushi-select not-started">
    <div class="not-started__title">suhi-chatへようこそ</div>
    <div class="not-started__textbox">
      <div class="not-started__textbox--title">技育CAMPハッカソン vol.5</div>
      <div>
        2日間(事前開発OK)で成果物を創ってエンジニアとしてレベルアップするオンラインハッカソン。テーマは「無駄開発」。
      </div>
    </div>
    <div class="not-started__warning">
      ルームはまだ開始されていないようです...<br />ルームが開始されましたら下記ボタンからご参加ください！
    </div>
    <div class="not-started__button">
      <button>参加する！</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "NotStarted",
})
</script>
