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
      <button
        class="more-button"
        aria-label="メニューを開閉する"
        @click="isOpenDetails = !isOpenDetails"
      >
        <MoreVerticalIcon aria-hidden="true"></MoreVerticalIcon>
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
        <DownloadIcon size="1.2x" aria-hidden="true"></DownloadIcon>
        <span class="text">現在までのチャット履歴のダウンロード</span>
      </div>
    </div>
    <div v-if="bookmarkContent != null" class="topic-header__bookmark">
      <div class="chatitem__bookmark">
        <PinIcon
          class="icon selected"
          aria-label="ピン留め"
          title="ピン留め"
        ></PinIcon>
      </div>
      <div class="topic-header__bookmark--text">{{ bookmarkContent }}</div>
      <button
        class="topic-header__bookmark--close-icon"
        aria-label="ピン留め解除"
        title="ピン留め解除"
        @click="removeBookmark()"
      >
        <XCircleIcon size="1.2x" aria-hidden="true"></XCircleIcon>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
// import SidebarDrawer from "@/components/Sidebar/SidebarDrawer.vue"
import { ChatItemModel } from "sushi-chat-shared"
import { DownloadIcon, MoreVerticalIcon, XCircleIcon } from "vue-feather-icons"
import PinIcon from "vue-material-design-icons/Pin.vue"
import { PinnedChatItemsStore, UserItemStore } from "~/store"

type DataType = {
  isAllCommentShowed: boolean
  isOpenDetails: boolean
}

export default Vue.extend({
  name: "TopicHeader",
  components: {
    // SidebarDrawer,
    XCircleIcon,
    PinIcon,
    MoreVerticalIcon,
    DownloadIcon,
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
      default: undefined,
    } as PropOptions<ChatItemModel | undefined>,
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
    bookmarkContent(): string | undefined {
      if (this.bookmarkItem?.type === "reaction") {
        return
      }
      return this.bookmarkItem?.content
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
    removeBookmark() {
      console.log("removeBookmark")
      if (this.bookmarkItem != null) {
        PinnedChatItemsStore.delete(this.bookmarkItem?.id)
      }
    },
  },
})
</script>
