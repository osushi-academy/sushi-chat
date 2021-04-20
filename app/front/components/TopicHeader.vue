<template>
  <div class="topic-header">
    <div class="main-line">
      <h1 class="title">{{ title }}</h1>
      <button class="next-button" role="navigation">
        <span class="material-icons"> arrow_forward </span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
  },
}
</script>