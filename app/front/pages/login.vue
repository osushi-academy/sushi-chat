<template>
  <button @click="signInWithGoogle">ログイン</button>
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
