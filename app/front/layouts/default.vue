<template>
  <div>
    <Nuxt />
  </div>
</template>
<script>
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
    ],
    title: 'SUSHI CHAT',
    meta: [
      {
        property: 'og:url',
        content: 'https://sushi-chat-liart.vercel.app/',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'sushi-chat',
      },
      {
        property: 'og:description',
        content: 'プレゼンテーションをもっとおいしく。',
      },
      {
        property: 'og:site_name',
        content: 'sushi-chat',
      },
      { property: 'twitter:card', content: 'summary' },
    ],
  },
}
</script>
