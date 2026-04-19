<template>
  <div v-hotkey.balance="showBalanceDialog">
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
      Budget difference: {{ $currency(summaryBalance) }}
      <v-btn variant="flat" size="small" class="ml-2" @click="balanceDialogVisible = true">Balance</v-btn> 
    </v-alert>
    <BalanceBudgetDialog v-model="balanceDialogVisible" />
  </div>
</template>

<script>
import BalanceBudgetDialog from './dialogs/BalanceBudgetDialog.vue';

export default {
  components: { BalanceBudgetDialog },
  data() {
    return {
      balanceDialogVisible: false,
    };
  },
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
  methods: {
    showBalanceDialog() {
      if (this.showBudgetWarning) {
        this.balanceDialogVisible = true;
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.alert {
  margin-bottom: 0;
  padding: 0.75rem 1rem;
}
</style>
