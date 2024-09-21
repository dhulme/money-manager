<template>
  <VSnackbar v-model="active" :timeout="4000" bottom>
    {{ appStore.snackbar.message }}
    <VBtn text @click.native="active = false">Close</VBtn>
  </VSnackbar>
</template>

<script>
import { mapStores } from 'pinia';
import { appStore } from '../store/app';

export default {
  computed: {
    ...mapStores(appStore),
    active: {
      get() {
        return this.appStore.snackbar.active;
      },
      set(value) {
        this.appStore.setSnackbarActive(value);
      },
    },
  },
};
</script>
