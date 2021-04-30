<template>
  <div class="heart-button-wraper">
    <div v-for="c of count" :key="c.id">
      <span
        class="heart-button material-icons"
        :class="{
          'heart-button-animation': stampAnimationFinished[c.id] === false,
        }"
        :style="{
          color: `hsl(${c.color.h}, ${c.color.s}%, ${c.color.l}%)`,
          top: `${c.y}%`,
          left: `${c.x}%`,
        }"
      >
        favorite
      </span>
      <span
        class="heart-button material-icons"
        :class="{
          'hheart-button-animation': stampAnimationFinished[c.id] === false,
        }"
        :style="{
          color: `hsla(${c.color.h}, ${c.color.s}%, ${c.color.l}%, 0.5)`,
          top: `${c.y + 10}%`,
          left: `${c.x + 10}%`,
        }"
      >
        favorite
      </span>
    </div>

    <button
      class="stamp-submit-button"
      :disabled="disabled"
      @click="clickFavorite"
    >
      <span class="material-icons"> favorite </span>
    </button>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { randomWaitedLoog } from '@/utils/waitedLoop'
import { HSLColor, getRandomColor } from '@/utils/color'

type FavoriteCallbackRegisterPropType = {
  favoriteCallbackRegister: (callback: (count: number) => void) => void
}

export type DataType = {
  show: boolean
  count: {
    id: number
    color: HSLColor
    x: number
    y: number
    colorSequence: number
  }[]
  lastClicked: number
  colorSequence: number
  stampAnimationFinished: Record<number, boolean>
}

export default Vue.extend({
  name: 'FavoriteButton',
  props: {
    favoriteCallbackRegister: {
      type: Function,
      required: true,
    } as PropOptions<FavoriteCallbackRegisterPropType>,
    disabled: {
      type: Boolean,
      required: true,
    },
  },
  data(): DataType {
    return {
      show: false,
      count: [],
      lastClicked: 0,
      colorSequence: 0,
      stampAnimationFinished: {},
    }
  },
  mounted() {
    this.$props.favoriteCallbackRegister((count: number) => {
      randomWaitedLoog(2000 / count, 500, count, () => {
        this.emitHeart()
      })
    })
  },
  methods: {
    clickFavorite() {
      if (this.disabled) return
      this.emitHeart()
      this.$emit('favorite')
    },
    emitHeart() {
      const colorSequence =
        new Date().getTime() - this.lastClicked < 1000
          ? this.colorSequence + 1
          : 0

      let key = null
      Object.entries(this.stampAnimationFinished).forEach(([k, v]) => {
        if (v) key = k
      })

      if (key) {
        this.$set(this.stampAnimationFinished, key, false)
        setTimeout(() => {
          this.$set(this.stampAnimationFinished, key, true)
        }, 1800)
        return
      }

      const id = (this.count.slice(-1)?.[0]?.id ?? 0) + 1

      // 最後の要素に1足した値を配列に加える
      this.count.push({
        id,
        color: getRandomColor(colorSequence),
        x: Math.floor(Math.random() * 40),
        y: Math.floor(Math.random() * 0),
        colorSequence,
      })
      // 配列の要素が100を超えたらリセットする
      if (this.count.length > 100) {
        this.count = []
      }

      this.lastClicked = new Date().getTime()
      this.colorSequence = colorSequence
      this.$set(this.stampAnimationFinished, id, false)
      setTimeout(() => {
        this.$set(this.stampAnimationFinished, id, true)
      }, 1800)
    },
  },
})
</script>
