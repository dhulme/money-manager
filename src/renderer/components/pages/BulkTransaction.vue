<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="headline">{{ bulkTransaction.name }}</span>
        <v-spacer />
        <v-text-field
          append-icon="search"
          label="Search"
          single-line
          hide-details
          v-model="search"
        />
      </v-card-title>
      <v-subheader>
        {{ bulkTransaction.description }}
      </v-subheader>
      <bulk-transaction-transactions
        :transactions="bulkTransaction.transactions"
        :search="search"
      />
      <v-card-actions>
        <v-btn @click="process" flat color="primary">Run</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
  import BulkTransactionTransactions from '../BulkTransactionTransactions';

  export default {
    components: {
      BulkTransactionTransactions
    },
    data() {
      return {
        search: '',
      };
    },
    computed: {
      bulkTransaction() {
        return this.$project.bulkTransaction(this.$route.params.bulkTransactionId);
      },
    },
    methods: {
      process() {
        this.$project.addTransactions(this.bulkTransaction.transactions);
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
