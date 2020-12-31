<template>
  <div>
    <VAlert
      v-model="hasError"
      color="error"
      icon="error"
      dismissible
      class="alert caption"
    >
      {{ error }}
    </VAlert>
    <VAlert
      v-show="showBudgetWarning"
      :color="color"
      :value="true"
      icon="info"
      class="alert caption"
    >
      Your budget and accounts are different by {{ summaryBalance | currency }}!
    </VAlert>
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
