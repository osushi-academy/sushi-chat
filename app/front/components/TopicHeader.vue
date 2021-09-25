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
        @click="clickShowAll()"
      >
        すべて
      </button>
      <button
        class="topic-header__details--filter-btn"
        :class="{ selected: isAllCommentShowed === false }"
        @click="clickNotShowAll()"
      >
        質問と回答のみ
      </button>
      <div class="topic-header__details--description">
        表示する項目を絞り込むことができます
      </div>
      <div class="topic-header__details--line" />
      <div class="topic-header__details--download" @click="clickDownload">
        <span class="material-icons"> file_download </span>
        <span class="text">現在までのチャット履歴のダウンロード</span>
      </div>
    </div>
    <div v-if="bookmarkContent !== ''" class="topic-header__bookmark">
      <button class="chatitem__bookmark" @click="isBookMarked = !isBookMarked">
        <span class="material-icons selected">push_pin</span>
      </button>
      <div class="topic-header__bookmark--text">{{ bookmarkContent }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
// import SidebarDrawer from "@/components/Sidebar/SidebarDrawer.vue"
import { ChatItemPropType } from "~/models/contents"
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
    bookmarkItem: {
      type: Object,
      required: true,
    } as PropOptions<ChatItemPropType>,
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
    bookmarkContent(): string {
      if (
        typeof this.bookmarkItem !== "undefined" &&
        this.bookmarkItem.type !== "reaction"
      ) {
        return this.bookmarkItem.content
      }
      return ""
    },
  },
  methods: {
    clickDownload() {
      this.$emit("download")
    },
    clickShowAll() {
      this.isAllCommentShowed = true
      this.$emit("click-show-all")
    },
    clickNotShowAll() {
      this.isAllCommentShowed = false
      this.$emit("click-not-show-all")
    },
  },
})
</script>
