<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Money Manager</v-app-bar-title>
    </v-app-bar>
    <v-main class="app-content">
      <router-view class="router-container" />
    </v-main>
  </v-app>
</template>

<script>
import { init } from './menu';

export default {
  name: 'App',
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
