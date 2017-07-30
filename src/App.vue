<template>
  <div id="app">
    <div class="container">
      <project-status></project-status>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import ProjectStatus from '@/components/ProjectStatus';

  export default {
    components: {
      ProjectStatus,
    },
    computed: {
    }
  };
</script>

<style lang="scss">
  
</style>
