<template>
  <div class="chatitem-wrapper">
    <article v-if="type == 'message'" class="comment">
      <div class="icon-wrapper">
        <img :src="icons[icon_id].icon" alt="" />
      </div>
      <div class="baloon">{{ content }}</div>
      <div class="bg-good-icon">
        <span class="material-icons"> thumb_up </span>
      </div>
    </article>
    <article v-if="type == 'reaction'" class="reaction">
      <div class="icon-wrapper">
        <img :src="icons[icon_id].icon" alt="" />
      </div>
      <span class="material-icons"> thumb_up </span>
      <div class="text">{{ content }}</div>
    </article>
  </div>
</template>
<script>
export default {
  props: {
    icon_id: Number,
    content: String,
    type: String,
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
