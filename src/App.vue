<template>
  <div class="app">
    <div class="container">
      <project-status></project-status>
      <summary-alert></summary-alert>
      <router-view class="router-container"></router-view>
    </div>
  </div>
</template>

<script>
  import menu from '@/menu';

  import SummaryAlert from '@/components/SummaryAlert';
  import ProjectStatus from '@/components/ProjectStatus';

  export default {
    components: {
      ProjectStatus,
      SummaryAlert,
    },
    mounted() {
      menu.init({
        saveClick: () => {
          this.$project.save();
        }
      });
      document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
          this.$router.push({
            name: 'dashboard',
          });
        }
      });
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
