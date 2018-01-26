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
        :transactions="transactions"
        :search="search"
        @transaction-click="editTransaction"
      />
      <v-card-actions>
        <v-btn @click="process" flat color="primary">Run</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialogVisible">
      <bulk-transaction-edit
        :transaction="transaction"
      />
    </v-dialog>
  </div>
</template>

<script>
  import BulkTransactionTransactions from '../BulkTransactionTransactions';
  import BulkTransactionEdit from '../BulkTransactionEdit';

  export default {
    components: {
      BulkTransactionTransactions,
      BulkTransactionEdit,
    },
    data() {
      return {
        search: '',
        dialogVisible: false,
        transaction: {},
      };
    },
    created() {
      this.$ipc.setTitle(this.bulkTransaction.name);
    },
    computed: {
      bulkTransaction() {
        return this.$project.bulkTransaction(this.$route.params.bulkTransactionId);
      },
      transactions() {
        return this.$project.bulkTransactionTransactions(this.bulkTransaction);
      }
    },
    methods: {
      process() {
        this.$project.runBulkTransactionTransactions(this.bulkTransaction, this.transactions);
      },
      editTransaction(transaction) {
        this.dialogVisible = true;
        this.transaction = transaction;
      }
    },
  };
</script>

<style lang="scss" scoped>
  header {
    display: flex;
    justify-content: space-between;
  }
</style>
