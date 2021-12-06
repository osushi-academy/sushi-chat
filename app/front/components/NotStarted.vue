<template>
  <div class="sushi-select not-started">
    <div class="sushi-select__bg" />
    <div class="not-started__title">suhi-chatへようこそ</div>
    <div
      v-if="room.title != '' || room.description != ''"
      class="not-started__textbox"
    >
      <div class="not-started__textbox--title">{{ room.title }}</div>
      <div>
        {{ room.description }}
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
import { RoomModel } from "sushi-chat-shared"
import { RoomStore } from "~/store"

export default Vue.extend({
  name: "NotStarted",
  computed: {
    room(): RoomModel {
      return RoomStore.room
    },
  },
  methods: {
    onClickEnter() {
      this.$emit("check-status-and-action")
    },
  },
})
</script>
