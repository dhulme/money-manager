<template>
  <div class="app">
    <div class="container">
      <project-status></project-status>
      <router-view class="router-container"></router-view>
    </div>
  </div>
</template>

<script>
  import ProjectStatus from '@/components/ProjectStatus';

  export default {
    components: {
      ProjectStatus,
    },
  };
</script>

<style lang="scss">
  .app {
    margin: 10px;
  }

  .router-container {
    margin-top: 10px;
  }
</style>
