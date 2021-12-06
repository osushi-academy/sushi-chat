<template>
  <div class="sidebar-drawer">
    <transition name="sidebar-drawer-transition">
      <SidebarContent
        v-if="showSidebar"
        :image-url="imageUrl"
        :show-humberger="true"
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
import SidebarContent from "@/components/Sidebar/SidebarContent.vue"

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
})
</script>
