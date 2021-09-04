<template>
  <div class="topic-header">
    <div class="main-line">
      <SidebarDrawer
        :title="'技育CAMPハッカソン vol.5'"
        :description="'2日間(事前開発OK)で成果物を創ってエンジニアとしてレベルアップするオンラインハッカソン。テーマは「無駄開発」。'"
        :topics="[
          { id: 1, label: 'おすしアカデミー' },
          { id: 2, label: '量子力学セミナー' },
          { id: 3, label: 'だしまきたまご' },
        ]"
      ></SidebarDrawer>
      <div class="index">
        #<span style="font-size: 80%">{{ topicIndex }}</span>
      </div>
      <div class="title">{{ title }}</div>
      <button
        v-show="isAdmin"
        class="download-button zap"
        :disabled="topicState === 'active'"
        @click="clickTopicActivate"
      >
        <zap-icon size="18"></zap-icon>
      </button>
      <button class="link-button">
        <span class="material-icons"> link </span>
      </button>
      <button class="more-button">
        <span class="material-icons"> more_vert </span>
      </button>
      <!--button class="download-button" @click="clickDownload">
        <download-icon size="18"></download-icon>
      </button-->
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from "vue"
import { DownloadIcon, ZapIcon } from "vue-feather-icons"
import { TopicState } from "@/models/contents"
import { UserItemStore } from "~/store"

export default Vue.extend({
  name: "TopicHeader",
  components: {
    DownloadIcon,
    ZapIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    topicState: {
      type: String,
      required: true,
    } as PropOptions<TopicState>,
    topicIndex: {
      type: String,
      required: true,
    },
  },
  computed: {
    isAdmin(): boolean {
      return UserItemStore.userItems.isAdmin
    },
  },
  methods: {
    clickTopicActivate() {
      this.$emit("topic-activate")
    },
    clickDownload() {
      this.$emit("download")
    },
  },
})
</script>
