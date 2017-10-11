<template>
  <v-app>
    <toolbar></toolbar>
    <main>
      <v-content>
        <v-container>
          <router-view class="router-container"></router-view>
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
  import menu from '@/menu';

  import Toolbar from '@/components/Toolbar';

  export default {
    components: {
      Toolbar,
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
  @import './_fonts.scss';
  
  .app {
    margin: 10px;
  }

  .router-container {
    margin-top: 10px;
  }
</style>
