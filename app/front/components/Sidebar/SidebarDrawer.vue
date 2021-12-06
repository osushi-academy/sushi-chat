<template>
  <div class="sidebar-drawer">
    <transition name="sidebar-drawer-transition">
      <SidebarContent
        v-if="showSidebar"
        :title="room.title"
        :description="room.description"
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
import { RoomModel, Topic } from "sushi-chat-shared"
import SidebarContent from "@/components/Sidebar/SidebarContent.vue"
import { TopicStore, RoomStore } from "~/store"

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
    room(): RoomModel {
      return RoomStore.room
    },
    topics(): Topic[] {
      // 各トピックの情報
      return TopicStore.topics
    },
  },
  methods: {},
})
</script>
