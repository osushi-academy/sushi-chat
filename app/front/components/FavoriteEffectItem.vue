<template>
  <span
    :key="c.id"
    class="heart-button material-icons"
    :style="{ background: `hsl(${c.color.h}, ${c.color.s}, ${c.color.l})` }"
  >
    favorite
  </span>
</template>
<script lang="ts">
export default {}
</script>
