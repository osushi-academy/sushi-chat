<template>
  <div class="sushi-select">
    <section class="sushi-select__section">
      <div class="sushi-select__progressbar">
        <div class="sushi-select__progressbar--circle" />
        <div class="sushi-select__progressbar--line" />
      </div>
      <article>
        <div class="sushi-select__section--title">1.アイコンを選んでね</div>
        <div class="sushi-select__section--icon-list">
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
            <picture>
              <source :srcset="icon.webp" type="image/webp" />
              <img :src="icon.png" alt="" />
            </picture>
          </button>
        </div>
      </article>
    </section>
    <section class="sushi-select__section">
      <div class="sushi-select__progressbar">
        <div class="sushi-select__progressbar--circle" />
        <div class="sushi-select__progressbar--line" />
      </div>
      <article>
        <div class="sushi-select__section--title">
          2. スピーカーの方は、セッション名をえらんでね
          <span class="sushi-select__section--help">
            <span class="material-icons"> help_outline</span>
            <div class="sushi-select__section--help--message">
              自分のセッション内では、コメントが強調されます。また、メッセージのピン留めなどの機能が利用できます。
            </div>
          </span>
        </div>
        <select name="speaker" class="sushi-select__section--speaker">
          <option>未選択</option>
          <option>大乱闘池奥ブラザーズ</option>
          <option>寿司処池奥</option>
        </select>
      </article>
    </section>
    <section class="sushi-select__section">
      <div class="sushi-select__progressbar">
        <div class="sushi-select__progressbar--circle" />
      </div>
      <article>
        <div class="sushi-select__section--title">
          3. さぁ、sushi-chatの世界へ！
        </div>
        <div class="sushi-select__section--start">
          <picture class="sushi-select__section--my-sushi">
            <source :srcset="userIcons[myIconId - 1].webp" type="image/webp" />
            <img :src="userIcons[myIconId - 1].png" alt="" />
          </picture>
          <div class="sushi-select__section--button">
            <button :disabled="myIconId < 1" type="button" @click="hideModal">
              参加する！
            </button>
          </div>
        </div>
      </article>
    </section>
  </div>
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
