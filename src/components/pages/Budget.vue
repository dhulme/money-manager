<template>
  <div>
    <h1>{{ budget.name }} Budget</h1>
    <transaction-list :transactions="budget.transactions"></transaction-list>
  </div>
</template>

<script>
  import TransactionList from '@/components/TransactionList';

  export default {
    components: {
      TransactionList
    },
    computed: {
      budget() {
        return this.$project.budget(this.$route.params.budgetId);
      },
    }
  }
</script>

<style>
  
</style>
