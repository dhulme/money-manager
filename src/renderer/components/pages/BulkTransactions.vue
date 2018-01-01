<template>
  <v-card>
    <v-card-title>
      <span class="title">Bulk Transactions</span>
      <v-spacer />
      <v-btn flat color="primary" @click="newBulkTransaction">Add</v-btn>
    </v-card-title>
    <bulk-transaction-list />
  </v-card>
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