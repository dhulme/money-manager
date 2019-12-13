<template>
  <VSnackbar v-model="active" :timeout="4000" bottom>
    {{ $store.state.snackbar.message }}
    <VBtn text @click.native="active = false">Close</VBtn>
  </VSnackbar>
</template>

<script>
export default {
  computed: {
    active: {
      get() {
        return this.$store.state.snackbar.active;
      },
      set(value) {
        this.$store.commit('setSnackbarActive', value);
      }
    }
  }
};
</script>
