<template>
  <div>
    <v-alert
      v-model="hasError"
      color="error"
      icon="mdi-alert-circle"
      closable
      class="alert caption"
    >
      {{ error }}
    </v-alert>
    <v-alert
      v-if="showBudgetWarning"
      :color="color"
      icon="mdi-information"
      class="alert caption"
    >
      Your budget and accounts are different by {{ $currency(summaryBalance) }}!
    </v-alert>
  </div>
</template>

<script>
export default {
  computed: {
    summaryBalance() {
      return this.$store.getters['project/summaryBalance'];
    },
    showBudgetWarning() {
      return (
        !this.error && !this.$store.getters['project/summaryBalanceEqualsZero']
      );
    },
    color() {
      return parseFloat(this.summaryBalance) >= 0 ? 'info' : 'error';
    },
    hasError: {
      get() {
        return !!this.$store.state.error;
      },
      set() {
        this.$store.commit('setError', '');
      },
    },
    error() {
      return this.$store.state.error;
    },
  },
};
</script>

<style lang="scss" scoped>
.alert {
  margin-bottom: 0;
  padding: 0.75rem 1rem;
}
</style>
