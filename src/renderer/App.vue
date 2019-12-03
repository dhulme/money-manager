<template>
  <VApp
    v-hotkey.save="$history.save"
    v-hotkey.saveAs="$history.saveAs"
    v-hotkey.open="$history.open"
    v-hotkey.undo="$history.undo"
    v-hotkey.redo="$history.redo"
    v-hotkey.new="$history.new"
    v-hotkey.quit="quit"
  >
    <TheToolbar />
    <main>
      <VContent class="app-content">
        <RouterView class="router-container" />
      </VContent>
    </main>
    <TheSnackbar />
    <TheDialogs />
  </VApp>
</template>

<script>
import menu from './menu';

import TheToolbar from './components/TheToolbar.vue';
import TheSnackbar from './components/TheSnackbar.vue';
import TheDialogs from './components/TheDialogs.vue';

export default {
  components: {
    TheToolbar,
    TheSnackbar,
    TheDialogs
  },
  computed: {
    development() {
      return !window.require;
    }
  },
  mounted() {
    menu.init({
      newClick: () => this.$history.new(),
      openClick: () => this.$history.open(),
      saveClick: () => this.$history.save(),
      undoClick: () => this.$history.undo(),
      redoClick: () => this.$history.redo(),
      saveAsClick: () => this.$history.saveAs(),
      exportSummaryClick: () => this.$history.exportSummary(),
      exportTransactionsClick: () => this.$history.exportTransactions(),
      aboutClick: () => this.$store.commit('setDialog', 'about'),
      settingsClick: () => this.$store.commit('setDialog', 'settings'),
      accountCategoriesClick: () =>
        this.$router.push({
          name: 'newAccountCategory'
        })
    });
  },
  methods: {
    quit() {
      window.close();
    }
  }
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

.required label::after {
  content: '*';
}
</style>
