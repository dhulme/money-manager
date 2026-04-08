<template>
  <v-app>
    <TheToolbar />
    <v-main>
      <div class="app-content">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { init } from './menu';
import TheToolbar from '@/components/TheToolbar.vue';

export default {
  name: 'App',
  components: { TheToolbar },
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
  padding: 0 20px;
}
</style>
