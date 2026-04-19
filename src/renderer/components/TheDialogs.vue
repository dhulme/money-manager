<template>
  <div v-hotkey.close="close">
    <AboutDialog />
    <SettingsDialog />
  </div>
</template>

<script>
import AboutDialog from './dialogs/AboutDialog.vue';
import SettingsDialog from './dialogs/SettingsDialog.vue';
import { useRootStore } from '../store/root';

export default {
  components: {
    AboutDialog,
    SettingsDialog
  },
  setup() {
    return { rootStore: useRootStore() };
  },
  methods: {
    close() {
      this.rootStore.setDialog(null);
    }
  }
};
</script>
