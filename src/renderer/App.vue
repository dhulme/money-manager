<template>
  <v-app>
    <the-toolbar />
    <main>
      <v-content class="app-content">
        <router-view class="router-container" />
      </v-content>
    </main>
  </v-app>
</template>

<script>
  import menu from './menu';

  import TheToolbar from './components/TheToolbar';

  export default {
    components: {
      TheToolbar,
    },
    computed: {
      development() {
        return !window.require;
      },
    },
    mounted() {
      menu.init({
        saveClick: () => {
          this.$project.save(this.$store.state.project);
        },
        accountsClick: () => {
          this.$router.push({
            name: 'accounts',
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
            name: 'accounts',
          });
        }
      });
    },
  };
</script>
  
<style lang="scss" scoped>
  .app-content {
    margin: 20px auto;
    max-width: 1400px;
  }

  .router-container {
    margin-top: 10px;
  }
</style>

<style lang="scss">
  @import './_fonts.scss';
</style>