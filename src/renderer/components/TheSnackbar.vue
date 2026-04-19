<template>
  <v-snackbar v-model="active" :timeout="4000" location="bottom">
    {{ rootStore.snackbar.message }}
    <template v-slot:actions>
      <v-btn variant="text" @click="active = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { useRootStore } from '../store/root';

export default {
  setup() {
    return { rootStore: useRootStore() };
  },
  computed: {
    active: {
      get() {
        return this.rootStore.snackbar.active;
      },
      set(value) {
        this.rootStore.setSnackbarActive(value);
      }
    }
  }
};
</script>
