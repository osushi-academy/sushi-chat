<template>
  <div class="sidebar-drawer">
    <transition name="sidebar-drawer-transition">
      <SidebarContent
        v-if="showSidebar"
        :image-url="imageUrl"
        :show-humberger="true"
        :class="'sidebar-content'"
        :click-humberger="closeSidebar"
      ></SidebarContent>
    </transition>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import SidebarContent from "@/components/Sidebar/SidebarContent.vue"
import { SidebarStore } from "~/store"

export default Vue.extend({
  name: "SidebarDrawer",
  components: {
    SidebarContent,
  },
  props: {
    imageUrl: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    showSidebar(): boolean {
      return SidebarStore.showSidebar
    },
  },
  methods: {
    closeSidebar() {
      SidebarStore.set(false)
    },
  },
})
</script>
