<template>
  <modal name="sushi-modal" :adaptive="true" :click-to-close="false">
    <div class="modal-header">
      <h2>アイコンを選んでね</h2>
    </div>
    <div class="modal-body">
      <div class="icon-list">
        <button
          v-for="(icon, index) in icons"
          :key="index"
          :class="{
            'icon-selected': iconChecked == index,
            'icon-shari': index === 10,
          }"
          class="icon-box"
          @click="selectIcon(index)"
        >
          <img :src="icon.url" alt="" class="sushi-fit" />
        </button>
      </div>
      <div class="modal-actions">
        <button
          :disabled="iconChecked < 0"
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
import Vue, { PropOptions } from 'vue'
import { IconsPropType } from '@/models/contents'

export default Vue.extend({
  name: 'SelectIconModal',
  props: {
    icons: {
      type: Array,
      required: true,
    } as PropOptions<IconsPropType>,
    iconChecked: {
      type: Number,
      required: true,
    },
  },
  methods: {
    selectIcon(index: number) {
      this.$emit('click-icon', index)
    },
    hideModal() {
      this.$emit('hide-modal')
    },
  },
})
</script>
