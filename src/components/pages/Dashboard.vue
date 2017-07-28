<template>
  <div>
    <h1>Overview</h1>
    <summary-alert></summary-alert>

    <h2>Accounts</h2>
    <accounts-list></accounts-list>

    <h2>Budgets</h2>
    <budgets-list></budgets-list>
  </div>
</template>

<script>
  import AccountsList from '@/components/AccountsList';
  import BudgetsList from '@/components/BudgetsList';
  import SummaryAlert from '@/components/SummaryAlert';

  export default {
    components: {
      AccountsList,
      SummaryAlert,
      BudgetsList
    },
  };
</script>

<style>
  
</style>
