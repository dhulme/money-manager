<template>
  <div>
    <v-alert
      v-show="error"
      value="true"
      color="error"
      icon="error"
    >
      {{ error }}
    </v-alert>
    <v-alert
      v-show="showBudgetWarning"
      :color="color"
      icon="info"
      value="true"
    >
      Your budget and accounts don't match! {{ summaryBalance | currency }}
    </v-alert>
  </div>
</template>

<script>
  export default {
    computed: {
      summaryBalance() {
        return this.$store.getters.summaryBalance;
      },
      showBudgetWarning() {
        return !this.error && !this.$store.getters.summaryBalanceEqualsZero;
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