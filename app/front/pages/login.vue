<template>
  <div class="lp">
    <header class="lp__header">
      <div class="lp__header--title">
        <img :src="require('@/static/icon.png')" />sushi-chat
      </div>
      <a
        class="lp__header--twitter"
        href="https://twitter.com/osushi_academy"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="require('@/assets/img/twitter.jpeg')" width="30px;" />
      </a>
    </header>
    <main class="lp__main">
      <div class="lp__main__text">
        <div class="lp__main__text--catchcopy">
          プレゼンテーションは<br />もっと美味しくなる
        </div>
        <br />
        <div class="lp__main__text--details">
          sushi-chat（スシチャット）は<br />
          プレゼンテーションを聞きながら匿名で感想を書き込め<br />
          いいねやスタンプも押せるチャットツールです。
        </div>
        <br />
        <br />
        <button class="lp__main--loginbutton" @click="signInWithGoogle">
          はじめる
        </button>
      </div>
      <div class="lp__main__img">
        <img :src="require('@/assets/img/LP_pc_and_sp.png')" />
      </div>
    </main>
    <footer class="lp__footer">
      &copy; osushi academy {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { AuthStore } from "~/store"
export default Vue.extend({
  computed: {
    isLoggedIn() {
      return AuthStore.isLoggedIn
    },
  },
  watch: {
    isLoggedIn: {
      immediate: true,
      handler() {
        if (this.isLoggedIn) {
          // NOTE: ログイン済みの場合はプロフィールページへリダイレクトする
          this.$router.push("/home")
        }
      },
    },
  },
  methods: {
    async signInWithGoogle() {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      try {
        await this.$fire.auth.signInWithRedirect(provider)
        console.log("LOGIN SUCCESS")
      } catch (e) {
        alert("ログインに失敗しました")
        console.error(e)
      }
    },
  },
})
</script>
