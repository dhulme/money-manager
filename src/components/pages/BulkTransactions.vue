<template>
  <div>
    <h1>Bulk Transactions</h1>
    <v-btn @click="newBulkTransaction">New</v-btn>
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

<style lang="scss">

</style>