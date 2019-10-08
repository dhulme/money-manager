<template>
  <VSnackbar
    v-model="active"
    :timeout="4000"
    bottom
  >
    {{ $store.state.snackbar.message }}
    <VBtn
      flat
      @click.native="active = false"
    >Close</VBtn>
  </VSnackbar>
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