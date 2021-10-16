<template>
  <div class="heart-button-wraper">
    <div v-for="c of count" :key="c.id">
      <span
        class="heart-button"
        :class="{
          'heart-button-animation': stampAnimationFinished[c.id] === false,
        }"
        :style="{
          color: `hsl(${c.color.h}, ${c.color.s}%, ${c.color.l}%)`,
          top: `${c.y}%`,
          left: `${c.x}%`,
        }"
      >
        <HeartIcon></HeartIcon>
      </span>
      <span
        class="heart-button"
        :class="{
          'heart-button-animation': stampAnimationFinished[c.id] === false,
        }"
        :style="{
          color: `hsla(${c.color.h}, ${c.color.s}%, ${c.color.l}%, 0.5)`,
          top: `${c.y + 20}%`,
          left: `${c.x + 10}%`,
        }"
      >
        <HeartIcon></HeartIcon>
      </span>
    </div>

    <button
      class="stamp-submit-button"
      :disabled="disabled"
      aira-label="ハート"
      @click="clickFavorite"
    >
      <HeartIcon :size="24" decorative class="icon"></HeartIcon>
    </button>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { StampModel } from "sushi-chat-shared"
import HeartIcon from "vue-material-design-icons/Heart.vue"
import { randomWaitedLoop } from "@/utils/waitedLoop"
import { HSLColor, getRandomColor } from "@/utils/color"
import { StampStore } from "~/store"

export type DataType = {
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
  name: "FavoriteButton",
  components: {
    HeartIcon,
  },
  props: {
    disabled: {
      type: Boolean,
      required: true,
    },
    topicId: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      count: [],
      lastClicked: 0,
      colorSequence: 0,
      stampAnimationFinished: {},
    }
  },
  computed: {
    stamps(): StampModel[] {
      return StampStore.stamps.filter((stamp) => stamp.topicId === this.topicId)
    },
  },
  watch: {
    stamps(newValue, oldValue) {
      newValue = newValue.slice(oldValue.length)
      if (newValue.length > 1) {
        randomWaitedLoop(2000 / newValue.length, 500, newValue.length, () => {
          this.emitHeart()
        })
      } else if (newValue.length === 1) {
        this.emitHeart()
      }
    },
  },
  methods: {
    clickFavorite() {
      if (this.disabled) return
      // Storeに追加し、サーバーに反映
      StampStore.sendFavorite(this.topicId)
    },

    // スタンプのアニメーション
    emitHeart() {
      const colorSequence =
        new Date().getTime() - this.lastClicked < 1000
          ? this.colorSequence + 1
          : 0

      let key: any = null
      Object.entries(this.stampAnimationFinished).forEach(([k, v]) => {
        if (v) key = k
      })

      if (key) {
        this.$set(this.stampAnimationFinished, key, false)
        const index = this.count.findIndex(({ id }) => `${id}` === key)
        this.count.splice(index, 1, {
          id: this.count[index].id,
          color: getRandomColor(),
          x: this.count[index].x,
          y: this.count[index].y,
          colorSequence,
        })
        setTimeout(() => {
          this.$set(this.stampAnimationFinished, key, true)
        }, 1800)
        this.colorSequence = colorSequence
        this.lastClicked = new Date().getTime()
        return
      }

      const id = (this.count.slice(-1)?.[0]?.id ?? 0) + 1

      // 最後の要素に1足した値を配列に加える
      this.count.push({
        id,
        color: getRandomColor(),
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
