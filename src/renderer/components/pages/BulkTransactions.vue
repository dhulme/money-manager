<template>
  <div>
    <header>
      <h3>Bulk Transactions</h3>
      <v-btn @click="newBulkTransaction">New</v-btn>
    </header>
    <bulk-transaction-list></bulk-transaction-list>
  </div>
</template>

<script>
  import BulkTransactionList from '@/components/BulkTransactionList';

  export default {
    components: {
      BulkTransactionList,
    },
    methods: {
      newBulkTransaction() {
        this.$router.push({
          name: 'newBulkTransaction',
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  header {
    display: flex;
    justify-content: space-between;
  }
</style>