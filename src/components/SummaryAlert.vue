<template>
  <div>
    <v-alert v-show="error" value="true" color="error" icon="error">
      {{ error }}
    </v-alert>
    <v-alert v-show="!error && summaryBalance !== '0'" :color="color" icon="info" value="true">
      Your budget and accounts don't match! {{ summaryBalance | currency }}
    </v-alert>
  </div>
</template>

<script>
  export default {
    computed: {
      summaryBalance() {
        return this.$store.state.summaryBalance;
      },
      color() {
        return this.summaryBalance > 0 ? 'info' : 'error';
      },
      error() {
        return this.$store.state.error;
      },
    },
  };
</script>

<style>
  
</style>
