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
import Vue, { PropOptions } from "vue"
import SidebarContent from "@/components/Sidebar/SidebarContent.vue"
import { MenuIcon } from "vue-feather-icons"

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
    topics: {
      type: Array,
      required: true,
    } as PropOptions<{ id: number; label: string }[]>, // NOTE: ここの受け渡しの形は暫定
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
  computed: {},
  methods: {},
})
</script>
