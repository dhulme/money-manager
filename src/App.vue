<template>
  <div class="app">
    <div class="container">
      <development-nav v-if="development"></development-nav>
      <summary-alert></summary-alert>
      <router-view class="router-container"></router-view>
    </div>
  </div>
</template>

<script>
  import menu from '@/menu';

  import SummaryAlert from '@/components/SummaryAlert';
  import DevelopmentNav from '@/components/DevelopmentNav';

  export default {
    components: {
      SummaryAlert,
      DevelopmentNav,
    },
    computed: {
      development() {
        return !window.require;
      },
    },
    mounted() {
      menu.init({
        saveClick: () => this.$project.save(),
        dashboardClick: () => {
          this.$router.push({
            name: 'dashboard',
          });
        },
        bulkTransactionsClick: () => {
          this.$router.push({
            name: 'bulkTransactions',
          });
        },
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
