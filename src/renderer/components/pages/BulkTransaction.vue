<template>
  <div
    v-hotkey.close="goToBulkTransactionsIfDialogClosed"
    v-hotkey.add="addTransaction"
  >
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ bulkTransaction.name }}</span>
        <v-btn variant="text" @click="addTransaction">Add</v-btn>
        <v-btn variant="text" @click="importTransactions">Import</v-btn>
        <v-btn variant="text" @click="clone">Clone</v-btn>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>
      <div class="d-flex align-center px-4 py-1">
        <div>{{ bulkTransaction.description }}</div>
        <v-spacer />
        <div v-if="bulkTransaction.lastModified" class="text-body-2 ml-2">
          Updated {{ $date(bulkTransaction.lastModified) }}
        </div>
      </div>
      <BulkTransactionTransactions
        :transactions="transactions"
        :search="search"
        @transaction-click="editTransaction"
      />
      <v-card-actions>
        <v-btn variant="text" color="primary" @click="process" :disabled="hasChanges"
          >Run</v-btn
        >
        <v-btn variant="text" @click="applyChanges" :disabled="!hasChanges"
          >Apply changes</v-btn
        >
        <v-btn variant="text" @click="discardChanges" :disabled="!hasChanges"
          >Discard changes</v-btn
        >
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialogVisible">
      <BulkTransactionEdit
        :transaction="transaction"
        :bulk-transaction="bulkTransaction"
        @saved="savedTransaction"
        @deleted="deletedTransaction"
        @close="dialogVisible = false"
      />
    </v-dialog>

    <v-dialog v-model="unappliedChangesDialogVisible" max-width="400">
      <v-card>
        <v-card-title>Unapplied changes</v-card-title>
        <v-card-text>Do you want to apply the changes you have made?</v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="confirmDiscardChanges">Don't apply</v-btn>
          <v-btn variant="text" color="primary" @click="confirmApplyChanges">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
      unappliedChangesDialogVisible: false,
      toLocation: null,
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
          date: new Date().toISOString(),
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
    async applyChanges() {
      await this.$store.dispatch('project/updateBulkTransaction', {
        ...this.bulkTransaction,
        transactions: this.transactions,
      });
      await this.$store.dispatch(
        'openSnackbar',
        'Applied bulk transaction changes'
      );
    },
    discardChanges() {
      this.transactions = JSON.parse(
        JSON.stringify(this.bulkTransactionTransactions)
      );
    },
    async confirmApplyChanges() {
      console.log('this.toLocation', this.toLocation);
      await this.applyChanges();
      this.$router.push({ name: this.toLocation.name });
    },
    async confirmDiscardChanges() {
      this.discardChanges();
      this.$router.push({ name: this.toLocation.name });
    },
  },
  beforeRouteLeave(to, from, next) {
    try {
      if (!this.unappliedChangesDialogVisible && this.hasChanges) {
        this.unappliedChangesDialogVisible = true;
        this.toLocation = to;
      } else {
        next();
      }
    } catch {
      next();
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
