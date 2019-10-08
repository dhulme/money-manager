<template>
  <div>
    <VAlert
      v-show="error"
      :value="true"
      color="error"
      icon="error"
    >
      {{ error }}
    </VAlert>
    <VAlert
      v-show="showBudgetWarning"
      :color="color"
      :value="true"
      icon="info"
    >
      Your budget and accounts don't match! {{ summaryBalance | currency }}
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
        return !this.error && !this.$store.getters['project/summaryBalanceEqualsZero'];
      },
      color() {
        return parseFloat(this.summaryBalance) >= 0 ? 'info' : 'error';
      },
      error() {
        return this.$store.state.error;
      },
    },
  };
</script>