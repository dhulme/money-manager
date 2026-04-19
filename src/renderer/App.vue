<template>
  <v-app>
    <TheToolbar />
    <TheDialogs />
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
import TheDialogs from '@/components/TheDialogs.vue';
import { useRootStore } from './store/root';

export default {
  name: 'App',
  components: { TheToolbar, TheDialogs },
  setup() {
    return { rootStore: useRootStore() };
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
      helpAbout: () => this.rootStore.setDialog('about'),
      editSettings: () => this.rootStore.setDialog('settings'),
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

<style lang="scss">
.v-dialog .v-card-text {
  padding: 24px;
}
</style>
