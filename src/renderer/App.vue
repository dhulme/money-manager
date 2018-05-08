<template>
  <v-app
    v-hotkey.save="$history.save"
    v-hotkey.saveAs="$history.saveAs"
    v-hotkey.open="$history.open"
    v-hotkey.undo="$history.undo"
    v-hotkey.redo="$history.redo"
  >
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
        newClick: () => this.$history.new(),
        openClick: () => this.$history.open(),
        saveClick: () => this.$history.save(),
        undoClick: () => this.$history.undo(),
        redoClick: () => this.$history.redo(),
        saveAsClick: () => this.$history.saveAs(),
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