<template>
  <VApp>
    <TheToolbar />
    <main>
      <VMain class="app-content">
        <RouterView class="router-container" />
      </VMain>
    </main>
    <TheSnackbar />
    <TheDialogs />
  </VApp>
</template>

<script>
import { init } from './menu';

import TheToolbar from './components/TheToolbar.vue';
import TheSnackbar from './components/TheSnackbar.vue';
import TheDialogs from './components/TheDialogs.vue';

export default {
  components: {
    TheToolbar,
    TheSnackbar,
    TheDialogs,
  },
  computed: {
    development() {
      return !window.require;
    },
  },
  mounted() {
    init({
      fileNew: () => this.$history.new(),
      fileOpen: () => this.$history.open(),
      fileSave: () => this.$history.save(),
      fileSaveAs: () => this.$history.saveAs(),
      editUndo: () => this.$history.undo(),
      editRedo: () => this.$history.redo(),
      exportSummary: () => this.$history.exportSummary(),
      exportTransactions: () => this.$history.exportTransactions(),
      helpAbout: () => this.$store.commit('setDialog', 'about'),
      editSettings: () => this.$store.commit('setDialog', 'settings'),
      editNewAccountCategory: () =>
        this.$router.push({
          name: 'newAccountCategory',
        }),
    });
  },
  methods: {
    quit() {
      window.close();
    },
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

.required label::after {
  content: '*';
}
</style>
