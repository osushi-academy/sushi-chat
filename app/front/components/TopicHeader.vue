<template>
  <div class="topic-header">
    <div class="main-line">
      <div v-if="!showSidebar" class="menu-button-wrapper">
        <button class="menu-button" @click="openSidebar">
          <menu-icon size="1x"></menu-icon>
        </button>
      </div>
      <div class="index">
        #<span style="font-size: 80%">{{ topicIndex }}</span>
      </div>
      <div class="title">{{ title }}</div>
      <button
        aria-label="メニューを開閉する"
        @click="isOpenDetails = !isOpenDetails"
      >
        <span class="more-button">
          <MoreVerticalIcon aria-hidden="true"></MoreVerticalIcon>
        </span>
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
    <div v-if="pinnedChatItemContent != null" class="topic-header__bookmark">
      <div class="chatitem__bookmark">
        <PinIcon
          class="icon selected"
          aria-label="ピン留め"
          title="ピン留め"
        ></PinIcon>
      </div>
      <button
        class="topic-header__bookmark--text"
        @click="clickScrollToMessage"
      >
        {{ pinnedChatItemContent }}
      </button>
      <button
        v-show="isAdmin || isSpeaker"
        aria-label="ピン留め解除"
        title="ピン留め解除"
        @click="removePinnedMessage"
      >
        <span class="topic-header__bookmark--close-icon">
          <XCircleIcon size="1.2x" aria-hidden="true"></XCircleIcon>
        </span>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import type { PropOptions } from "vue"
import { ChatItemModel } from "sushi-chat-shared"
import {
  DownloadIcon,
  MoreVerticalIcon,
  XCircleIcon,
  MenuIcon,
} from "vue-feather-icons"
import PinIcon from "vue-material-design-icons/Pin.vue"
import { PinnedChatItemsStore, UserItemStore, SidebarStore } from "~/store"

type DataType = {
  isAllCommentShowed: boolean
  isOpenDetails: boolean
}

export default Vue.extend({
  name: "TopicHeader",
  components: {
    XCircleIcon,
    PinIcon,
    MoreVerticalIcon,
    DownloadIcon,
    MenuIcon,
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
    pinnedChatItem: {
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
    isSpeaker(): boolean {
      return UserItemStore.userItems.speakerId === this.topicIndex
    },
    pinnedChatItemContent(): string | undefined {
      if (this.pinnedChatItem?.type === "reaction") {
        return
      }
      return this.pinnedChatItem?.content
    },
    showSidebar(): boolean {
      return SidebarStore.showSidebar
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
    removePinnedMessage() {
      if (this.pinnedChatItem != null) {
        PinnedChatItemsStore.send({
          chatItemId: this.pinnedChatItem?.id,
          topicId: this.topicIndex,
        })
      }
    },
    clickScrollToMessage() {
      if (this.pinnedChatItem == null) {
        return
      }
      const element: HTMLElement | null = document.getElementById(
        this.pinnedChatItem.id,
      )
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
        element.classList.add("highlight")
        setTimeout(() => {
          element.classList.remove("highlight")
        }, 0)
      }
    },
    openSidebar() {
      SidebarStore.set(true)
    },
  },
})
</script>
