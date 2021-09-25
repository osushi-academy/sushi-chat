<template>
  <div class="sidebar-drawer">
    <transition name="sidebar-drawer-transition">
      <SidebarContent
        v-if="showSidebar"
        :title="title"
        :description="description"
        :image-url="imageUrl"
        :show-humberger="true"
        :topics="topics"
        :class="'sidebar-content'"
        :click-humberger="() => (showSidebar = !showSidebar)"
      ></SidebarContent>
    </transition>
    <div class="menu-button-wrapper">
      <button class="menu-button" @click="showSidebar = true">
        <menu-icon size="1x"></menu-icon>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { MenuIcon } from "vue-feather-icons"
import { Topic } from "sushi-chat-shared"
import SidebarContent from "@/components/Sidebar/SidebarContent.vue"
import { TopicStore } from "~/store"

type DataType = {
  showSidebar: boolean
}

export default Vue.extend({
  name: "SidebarDrawer",
  components: {
    SidebarContent,
    MenuIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: undefined,
    },
  },
  data(): DataType {
    return {
      showSidebar: true,
    }
  },
  computed: {
    topics(): Topic[] {
      // 各トピックの情報
      return TopicStore.topics
    },
  },
  methods: {},
})
</script>
