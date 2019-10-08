<template>
  <div
    v-hotkey.close="goToBulkTransactionsIfDialogClosed"
    v-hotkey.add="addTransaction"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">{{ bulkTransaction.name }}</span>
        <VBtn
          flat
          @click="addTransaction"
        >Add</VBtn>
        <VSpacer />
        <VTextField
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        />
      </VCardTitle>
      <VSubheader>
        {{ bulkTransaction.description }}
      </VSubheader>
      <bulk-transaction-transactions
        :transactions="transactions"
        :search="search"
        @transaction-click="editTransaction"
      />
      <VCardActions>
        <VBtn
          flat
          color="primary"
          @click="process"
        >Run</VBtn>
        <VBtn flat @click="duplicate">Duplicate</VBtn> 
      </VCardActions>
    </VCard>

    <VDialog v-model="dialogVisible">
      <BulkTransactionEdit
        :transaction="transaction"
        :bulk-transaction="bulkTransaction"
        @saved="savedTransaction"
        @close="dialogVisible = false"
      />
    </VDialog>
  </div>
</template>

<script>
  import moment from 'moment';

  import util from '../../util';

  import BulkTransactionTransactions from '../BulkTransactionTransactions.vue';
  import BulkTransactionEdit from '../BulkTransactionEdit.vue';

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
      duplicate() {
        this.$store.commit('setNewBulkTransaction', {
          ...this.bulkTransaction,
          transactions: this.transactions
        });
        this.$router.push({
          name: 'newBulkTransaction',
        });
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
