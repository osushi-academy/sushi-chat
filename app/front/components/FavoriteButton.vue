<template>
  <button class="stamp-submit-button" @click="clickFavorite">
    <span class="material-icons"> favorite </span>
    <div v-for="c of count" :key="c">
      <span class="heart-button"></span>
    </div>
  </button>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import waitedLoop from '@/utils/waitedLoop'

type FavoriteCallbackRegisterPropType = {
  favoriteCallbackRegister: (callback: (count: number) => void) => void
}

export type DataType = {
  show: boolean
  count: number[]
}

export default Vue.extend({
  name: 'FavoriteButton',
  props: {
    favoriteCallbackRegister: {
      type: Function,
      required: true,
    } as PropOptions<FavoriteCallbackRegisterPropType>,
  },
  data(): DataType {
    return {
      show: false,
      count: [],
    }
  },
  mounted() {
    this.$props.favoriteCallbackRegister((count: number) => {
      waitedLoop(2000 / count, count, () => {
        // 最後の要素に1足した値を配列に加える
        this.count.push((this.count.slice(-1)?.[0] ?? 0) + 1)
        // 配列の要素が50を超えたら25個消す（ハートは最大25個のみ表示する）
        if (this.count.length > 50) {
          this.count = this.count.slice(-25)
        }
      })
    })
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
