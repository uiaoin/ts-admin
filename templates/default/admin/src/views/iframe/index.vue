<template>
  <div class="iframe-container">
    <iframe :src="url" frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const url = computed(() => route.meta.url as string);
</script>

<style lang="less" scoped>
.iframe-container {
  width: 100%;
  height: calc(100vh - 120px);

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
