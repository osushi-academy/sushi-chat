<template>
  <button class="stamp-submit-button" @click="clickFavorite">
    <span class="material-icons"> favorite </span>
    <div v-for="c of count" :key="c">
      <span class="heart-button"></span>
    </div>
  </button>
</template>
<script lang="ts">
import Vue from 'vue'
export type DataType = {
  show: boolean
  count: number[]
}

export default Vue.extend({
  name: 'FavoriteButton',
  data(): DataType {
    return {
      show: false,
      count: [],
    }
  },
  methods: {
    clickFavorite() {
      // 最後の要素に1足した値を配列に加える
      this.count.push((this.count.slice(-1)?.[0] ?? 0) + 1)
      // 配列の要素が50を超えたら25個消す（ハートは最大25個のみ表示する）
      if (this.count.length > 50) {
        this.count = this.count.slice(-25)
      }

      this.$emit('favorite')
    },
  },
})
</script>
