<template>
  <div
    v-hotkey.close="goToBulkTransactionsIfDialogClosed"
    v-hotkey.add="addTransaction"
  >
    <VCard>
      <VCardTitle>
        <span class="headline">{{ bulkTransaction.name }}</span>
        <VBtn text @click="addTransaction">Add</VBtn>
        <VBtn text @click="importTransactions">Import</VBtn>
        <VBtn text @click="clone">Clone</VBtn>
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
        <div>{{ bulkTransaction.description }}</div>
        <VSpacer />
        <div v-if="bulkTransaction.lastModified" class="body-2 ml-2">
          Updated {{ bulkTransaction.lastModified | date }}
        </div>
      </VSubheader>
      <BulkTransactionTransactions
        :transactions="transactions"
        :search="search"
        @transaction-click="editTransaction"
      />
      <VCardActions>
        <VBtn text color="primary" @click="process">Run</VBtn>
        <VBtn text @click="applyChanges" :disabled="!hasChanges"
          >Apply changes</VBtn
        >
        <VBtn text @click="discardChanges" :disabled="!hasChanges"
          >Discard changes</VBtn
        >
      </VCardActions>
    </VCard>

    <VDialog v-model="dialogVisible">
      <BulkTransactionEdit
        :transaction="transaction"
        :bulk-transaction="bulkTransaction"
        @saved="savedTransaction"
        @deleted="deletedTransaction"
        @close="dialogVisible = false"
      />
    </VDialog>
  </div>
</template>

<script>
import moment from 'moment';

import { getId } from '../../util';

import BulkTransactionTransactions from '../BulkTransactionTransactions.vue';
import BulkTransactionEdit from '../BulkTransactionEdit.vue';
import importBulkTransactions from './importBulkTransactions';

export default {
  components: {
    BulkTransactionTransactions,
    BulkTransactionEdit,
  },
  mixins: [importBulkTransactions],
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
      return this.$store.getters['project/bulkTransaction'](
        this.$route.params.bulkTransactionId
      );
    },
    bulkTransactionTransactions() {
      return this.$store.getters['project/bulkTransactionTransactions'](
        this.bulkTransaction
      );
    },
    hasChanges() {
      return (
        JSON.stringify(this.transactions) !==
        JSON.stringify(this.bulkTransactionTransactions)
      );
    },
  },
  watch: {
    bulkTransactionTransactions() {
      this.discardChanges();
    },
  },
  created() {
    this.discardChanges();
    this.$ipc.setTitle(this.bulkTransaction.name);
  },
  methods: {
    process() {
      this.$store.dispatch('project/runBulkTransactionTransactions', {
        bulkTransaction: this.bulkTransaction,
        transactions: this.transactions.map((transaction) => ({
          ...transaction,
          id: getId(),
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
      const index = this.transactions.findIndex((_) => _.id === transaction.id);
      if (index !== -1) {
        this.transactions.splice(index, 1, transaction);
      } else {
        this.transactions.push(transaction);
      }
    },
    deletedTransaction(transaction) {
      this.dialogVisible = false;
      const index = this.transactions.findIndex((_) => _.id === transaction.id);
      this.transactions.splice(index, 1);
    },
    goToBulkTransactionsIfDialogClosed() {
      if (!this.$store.state.dialog && !this.dialogVisible) {
        this.$router.push({
          name: 'bulkTransactions',
        });
      }
    },
    clone() {
      this.$store.commit('setNewBulkTransaction', {
        ...this.bulkTransaction,
        transactions: this.transactions,
      });
      this.$router.push({
        name: 'newBulkTransaction',
      });
    },
    applyChanges() {
      this.$store.dispatch('project/updateBulkTransaction', {
        ...this.bulkTransaction,
        transactions: this.transactions,
      });
      this.$store.dispatch('openSnackbar', 'Applied bulk transaction changes');
    },
    discardChanges() {
      this.transactions = JSON.parse(
        JSON.stringify(this.bulkTransactionTransactions)
      );
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
