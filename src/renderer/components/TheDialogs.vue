<template>
  <div v-hotkey.settings="openSettingsDialog">
    <AboutDialog />
    <SettingsDialog />
  </div>
</template>

<script>
import AboutDialog from './dialogs/AboutDialog';
import SettingsDialog from './dialogs/SettingsDialog';

export default {
  components: {
    AboutDialog,
    SettingsDialog
  },
  methods: {
    openSettingsDialog() {
      this.$store.commit('setDialog', 'settings');
    }
  }
};
</script>
