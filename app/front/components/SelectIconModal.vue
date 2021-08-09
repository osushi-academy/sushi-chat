<template>
  <modal name="sushi-modal" :adaptive="true" :click-to-close="false">
    <div class="modal-header">
      <h2>アイコンを選んでね</h2>
    </div>
    <div class="modal-body">
      <div class="icon-list">
        <button
          v-for="(icon, index) in userIcons"
          :key="index"
          :class="{
            'icon-selected': myIconId - 1 == index,
            'icon-shari': index === 10,
          }"
          class="icon-box"
          @click="selectIcon(index)"
        >
          <img :src="icon.png" alt="" class="sushi-fit" />
        </button>
      </div>
      <div class="modal-actions">
        <button
          :disabled="myIconId < 1"
          type="button"
          class="primary-button"
          @click="hideModal"
        >
          はじめる
        </button>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from "vue"
import ICONS from "@/utils/icons"
import { UserItemStore } from "~/store"

export default Vue.extend({
  name: "SelectIconModal",
  computed: {
    myIconId() {
      return UserItemStore.userItems.myIconId
    },
    userIcons() {
      return ICONS.slice(1)
    },
  },
  methods: {
    selectIcon(index: number) {
      this.$emit("click-icon", index + 1)
    },
    hideModal() {
      this.$emit("hide-modal")
    },
  },
})
</script>
