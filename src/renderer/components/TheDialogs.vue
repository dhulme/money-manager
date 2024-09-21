<template>
  <div v-hotkey.close="close">
    <AboutDialog />
    <SettingsDialog />
  </div>
</template>

<script>
import AboutDialog from './dialogs/AboutDialog.vue';
import SettingsDialog from './dialogs/SettingsDialog.vue';

export default {
  components: {
    AboutDialog,
    SettingsDialog,
  },
  methods: {
    close() {
      this.$store.commit('setDialog', null);
    },
  },
};
</script>
