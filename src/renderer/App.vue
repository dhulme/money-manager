<template>
  <v-app>
    <the-toolbar />
    <main>
      <v-content class="app-content">
        <router-view class="router-container" />
      </v-content>
    </main>
    <the-snackbar />
  </v-app>
</template>

<script>
  import menu from './menu';

  import TheToolbar from './components/TheToolbar';
  import TheSnackbar from './components/TheSnackbar';

  export default {
    components: {
      TheToolbar,
      TheSnackbar,
    },
    computed: {
      development() {
        return !window.require;
      },
    },
    mounted() {
      menu.init({
        saveClick: () => {
          this.$history.save();
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
        undoClick: () => {
          this.$history.undo();
        },
        redoClick: () => {
          this.$history.redo();
        },
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