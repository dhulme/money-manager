<template>
  <div
    v-hotkey.close="goToBulkTransactionsIfDialogClosed"
    v-hotkey.add="addTransaction"
  >
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
        @saved="savedTransaction"
        @close="dialogVisible = false"
      />
    </v-dialog>
  </div>
</template>

<script>
  import moment from 'moment';

  import util from '../../util';

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
        transactions: [],
      };
    },
    computed: {
      bulkTransaction() {
        return this.$store.getters['project/bulkTransaction'](this.$route.params.bulkTransactionId);
      },
    },
    created() {
      this.transactions = this.$store.getters['project/bulkTransactionTransactions'](this.bulkTransaction);
      this.$ipc.setTitle(this.bulkTransaction.name);
    },
    methods: {
      process() {
        this.$store.dispatch('project/runBulkTransactionTransactions', {
          bulkTransaction: this.bulkTransaction,
          transactions: this.transactions.map(transaction => ({
            ...transaction,
            id: util.getId(),
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
      savedTransaction(transaction) {
        this.dialogVisible = false;
        const index = this.transactions.findIndex(_ => _.id === transaction.id);
        if (index !== -1) {
          this.transactions.splice(index, 1, transaction);
        } else {
          this.transactions.push(transaction);
        }
      },
      goToBulkTransactionsIfDialogClosed() {
        if (!this.dialogVisible) {
          this.$router.push({
            name: 'bulkTransactions',
          });
        }
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
