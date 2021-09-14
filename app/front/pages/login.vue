<template>
  <button @click="signInWithGoogle">ログイン</button>
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  methods: {
    async signInWithGoogle() {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      try {
        await this.$fire.auth.signInWithPopup(provider)
        console.log("LOGIN SUCCESS")
      } catch (e) {
        alert("ログインに失敗しました")
        console.error(e)
      }
    },
  },
})
</script>
