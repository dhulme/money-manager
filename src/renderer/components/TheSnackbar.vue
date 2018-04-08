<template>
  <v-snackbar
    v-model="active"
    :timeout="3000"
    bottom
  >
    {{ $store.state.snackbar.message }}
    <v-btn
      flat
      @click.native="active = false"
    >Close</v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    data() {
      return {
        active: this.$store.state.snackbar.active,
      };
    },
    watch: {
      '$store.state.snackbar.active': function watch(newValue, oldValue) {
        if (oldValue !== newValue) {
          this.active = newValue;
        }
      },
      active(newValue, oldValue) {
        if (oldValue !== newValue) {
          this.$store.commit('setSnackbarActive', newValue);
        }
      },
    },
  };
</script>

<style lang="scss">

</style>