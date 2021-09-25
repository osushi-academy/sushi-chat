<template>
  <div class="topic-header">
    <div class="main-line">
      <!-- TODO:横スクロールから1セッションへの切り替えが完了するまで非表示 -->
      <!-- <SidebarDrawer
        :title="'技育CAMPハッカソン vol.5'"
        :description="'2日間(事前開発OK)で成果物を創ってエンジニアとしてレベルアップするオンラインハッカソン。テーマは「無駄開発」。'"
      /> -->
      <div class="index">
        #<span style="font-size: 80%">{{ topicIndex }}</span>
      </div>
      <div class="title">{{ title }}</div>
      <button class="more-button" @click="isOpenDetails = !isOpenDetails">
        <span class="material-icons"> more_vert </span>
      </button>
    </div>
    <div v-if="isOpenDetails" class="topic-header__details">
      <button
        class="topic-header__details--filter-btn"
        :class="{ selected: isAllCommentShowed === true }"
        @click="isAllCommentShowed = true"
      >
        すべて
      </button>
      <button
        class="topic-header__details--filter-btn"
        :class="{ selected: isAllCommentShowed === false }"
        @click="isAllCommentShowed = false"
      >
        質問と回答
      </button>
      <div class="topic-header__details--description">
        質問と回答：
        質問と回答のみ表示されます（運営やスピーカーの投稿も表示されます）
      </div>
      <div class="topic-header__details--line" />
      <div class="topic-header__details--download" @click="clickDownload">
        <span class="material-icons"> file_download </span>
        <span class="text">現在までのチャット履歴のダウンロード</span>
      </div>
    </div>
    <div class="topic-header__bookmark">
      <span class="chatitem__bookmark" @click="isBookMarked = !isBookMarked">
        <span class="material-icons selected">push_pin</span>
      </span>
      <div class="topic-header__bookmark--text">
        アイデア出しのフレームワークは案出しにおいてとても便利なので皆さん利用してみましょう
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
// import SidebarDrawer from "@/components/Sidebar/SidebarDrawer.vue"
import { UserItemStore } from "~/store"

type DataType = {
  isAllCommentShowed: boolean
  isOpenDetails: boolean
}

export default Vue.extend({
  name: "TopicHeader",
  components: {
    // SidebarDrawer,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    topicIndex: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      isAllCommentShowed: true,
      isOpenDetails: false,
    }
  },
  computed: {
    isAdmin(): boolean {
      return UserItemStore.userItems.isAdmin
    },
  },
  methods: {
    clickDownload() {
      this.$emit("download")
    },
  },
})
</script>
