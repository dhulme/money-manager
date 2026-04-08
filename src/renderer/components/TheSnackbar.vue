<template>
  <v-snackbar v-model="active" :timeout="4000" location="bottom">
    {{ $store.state.snackbar.message }}
    <template v-slot:actions>
      <v-btn variant="text" @click="active = false">Close</v-btn>
    </template>
  </v-snackbar>
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
