<template>
  <div class="sushi-select not-started">
    <div class="sushi-select__bg" />
    <div class="not-started__title">suhi-chatへようこそ</div>
    <div class="not-started__textbox">
      <div class="not-started__textbox--title">{{ title }}</div>
      <div>
        {{ description }}
      </div>
    </div>
    <div class="not-started__warning">
      ルームはまだ開始されていないようです...<br />ルームが開始されましたら下記ボタンからご参加ください！
    </div>
    <div class="not-started__button">
      <button @click="onClickEnter()">参加する！</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "NotStarted",
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  methods: {
    onClickEnter() {
      this.$emit("check-status-and-action")
    },
  },
})
</script>
