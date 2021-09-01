<template>
  <div class="home">
    <Header>sushi-chat</Header>
    <div class="home__main">
      <Nuxt />
    </div>
  </div>
</template>
<script>
import Header from "@/components/Home/Header.vue"

export default {
  components: {
    Header,
  },
  head: {
    link: [
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/modern-css-reset/dist/reset.min.css",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
      },
    ],
    title: "sushi-chat",
  },
}
</script>
