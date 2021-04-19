<template>
  <div class="chatitem-wrapper">
    <article class="comment">
      <div class="icon-wrapper">
        <img :src="icons[iconNum].icon" alt="" />
      </div>
      <div class="baloon">{{ text }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>
  </div>
</template>
<script>
export default {
  props: {
    iconNum: Number,
    text: String,
  },
  data() {
    return {
      icons: [
        { icon: require('@/assets/img/sushi_akami.png') },
        { icon: require('@/assets/img/sushi_ebi.png') },
        { icon: require('@/assets/img/sushi_harasu.png') },
        { icon: require('@/assets/img/sushi_ikura.png') },
        { icon: require('@/assets/img/sushi_iwashi.png') },
        { icon: require('@/assets/img/sushi_kai_hokkigai.png') },
        { icon: require('@/assets/img/sushi_salmon.png') },
        { icon: require('@/assets/img/sushi_shirasu.png') },
        { icon: require('@/assets/img/sushi_syari.png') },
        { icon: require('@/assets/img/sushi_tai.png') },
        { icon: require('@/assets/img/sushi_uni.png') },
      ],
    }
  },
}
</script>
