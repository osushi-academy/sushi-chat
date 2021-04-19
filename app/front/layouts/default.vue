<template>
  <div>
    <Nuxt />
  </div>
</template>
<script lang="ts">
export default {
  head: {
    link: [
      {
        rel: 'stylesheet',
        href:
          'https://cdn.jsdelivr.net/npm/modern-css-reset/dist/reset.min.css',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
      },
    ],
    title: 'SUSHI CHAT',
  },
}
</script>