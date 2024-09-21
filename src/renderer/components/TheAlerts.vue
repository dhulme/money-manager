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
      Your budget and accounts are different by
      {{ $filters.currency(summaryBalance) }}!
    </VAlert>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useProjectStore } from '../store/project';

export default {
  computed: {
    ...mapStores(useProjectStore),
    summaryBalance() {
      return this.projectStore.summaryBalance;
    },
    showBudgetWarning() {
      return !this.error && !this.projectStore.summaryBalanceEqualsZero;
    },
    color() {
      return parseFloat(this.summaryBalance) >= 0 ? 'info' : 'error';
    },
    hasError: {
      get() {
        return !!this.projectStore.error;
      },
      set() {
        this.projectStore.setError('');
      },
    },
    error() {
      return this.projectStore.error;
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
