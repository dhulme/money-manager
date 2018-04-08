<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="headline">{{ bulkTransaction.name }}</span>
        <v-btn
          flat
          @click="addTransaction"
        >Add</v-btn>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
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
        <v-btn
          flat
          color="primary"
          @click="process"
        >Run</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialogVisible">
      <bulk-transaction-edit
        :transaction="transaction"
        :bulk-transaction="bulkTransaction"
        @close="dialogVisible = false"
      />
    </v-dialog>
  </div>
</template>

<script>
  import moment from 'moment';

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
    computed: {
      bulkTransaction() {
        return this.$store.getters.bulkTransaction(this.$route.params.bulkTransactionId);
      },
      transactions() {
        return this.$store.getters.bulkTransactionTransactions(this.bulkTransaction);
      },
    },
    created() {
      this.$ipc.setTitle(this.bulkTransaction.name);
    },
    methods: {
      process() {
        this.$store.dispatch('runBulkTransactionTransactions', {
          bulkTransaction: this.bulkTransaction,
          transactions: this.transactions.map(transaction => ({
            ...transaction,
            date: moment(),
          })),
        });
        this.$store.dispatch('openSnackbar', 'Transactions done');
      },
      editTransaction(transaction) {
        this.transaction = transaction;
        this.dialogVisible = true;
      },
      addTransaction() {
        this.transaction = {};
        this.dialogVisible = true;
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
