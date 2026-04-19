<template>
  <div v-hotkey.close="closeDialog">
    <v-card class="mb-4">
      <v-card-title class="text-h6">{{ account.name }}</v-card-title>
      <v-card-actions>
        <v-btn variant="text" color="error" @click="deleteAccount">Delete</v-btn>
        <v-btn variant="text" @click="goToEditAccount">Edit</v-btn>
        <v-btn variant="text" @click="goToInsights">Insights</v-btn>
        <v-btn
          v-if="account.importTransactionsFormatId"
          variant="text"
          @click="importTransactions"
          >Import</v-btn
        >
      </v-card-actions>
    </v-card>

    <TransactionList
      :account="account"
      :transactions="transactions"
      @edit-transaction="editTransaction"
      @add-transaction="addTransaction"
    />

    <v-dialog
      v-model="editTransactionDialogVisible"
      max-width="500px"
      persistent
      no-click-animation
    >
      <TransactionEdit
        :transaction="transaction"
        :account="account"
        @close="editTransactionDialogVisible = false"
        @added="editTransactionDialogVisible = false"
        @updated="editTransactionDialogVisible = false"
      />
    </v-dialog>

    <v-dialog
      v-model="importTransactionsDialogVisible"
      persistent
      no-click-animation
    >
      <ImportTransactions
        ref="importTransactions"
        :account="account"
        @close="importTransactionsDialogVisible = false"
        :visible="importTransactionsDialogVisible"
      />
    </v-dialog>

    <v-dialog v-model="cannotDeleteAccountDialogVisible" max-width="400">
      <v-card>
        <v-card-title>Cannot delete account</v-card-title>
        <v-card-text
          >You can only delete an account if the balance is zero.</v-card-text
        >
        <v-card-actions>
          <v-btn
            variant="text"
            color="primary"
            @click="cannotDeleteAccountDialogVisible = false"
            >Ok</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Big from 'big.js';
import TransactionList from '../TransactionList.vue';
import TransactionEdit from '../TransactionEdit.vue';
import ImportTransactions from '../ImportTransactions.vue';
import { importTransactionsFormats } from '../../import-transactions';
import { useProjectStore } from '../../store/project';
import { useRootStore } from '../../store/root';

export default {
  components: {
    TransactionList,
    TransactionEdit,
    ImportTransactions,
  },
  setup() {
    return { projectStore: useProjectStore(), rootStore: useRootStore() };
  },
  data() {
    return {
      editTransactionDialogVisible: false,
      importTransactionsDialogVisible: false,
      transaction: {},
      importTransactionsActive: false,
      cannotDeleteAccountDialogVisible: false,
    };
  },
  computed: {
    account() {
      return this.projectStore.getAccount(this.accountId);
    },
    transactions() {
      return this.projectStore.getTransactions(this.account);
    },
    accountId() {
      return this.$route.params.accountId;
    },
    importedTransactions() {
      return this.rootStore.importedTransactions;
    },
  },
  created() {
    this.$ipc.setTitle(this.account.name);
  },
  watch: {
    importedTransactions(value) {
      if (value.length) {
        this.importTransactionsDialogVisible = true;
      }
    },
  },
  methods: {
    deleteAccount() {
      if (new Big(this.account.balance).eq(0)) {
        this.projectStore.deleteAccount(this.accountId);
        this.$router.push({ name: 'accounts' });
      } else {
        this.cannotDeleteAccountDialogVisible = true;
      }
    },
    addTransaction() {
      this.transaction = {};
      this.editTransactionDialogVisible = true;
    },
    closeDialog() {
      if (
        this.rootStore.dialog ||
        this.editTransactionDialogVisible ||
        this.importTransactionsActive
      ) {
        this.editTransactionDialogVisible = false;
      } else if (this.importTransactionsDialogVisible) {
        this.$refs.importTransactions.confirmCancel();
      } else {
        this.rootStore.setSearch('');
        this.$router.push({
          name: 'accounts',
        });
      }
    },
    goToEditAccount() {
      this.$router.push({
        name: 'editAccount',
        params: {
          accountId: this.accountId,
          accountCategory: this.$route.params.accountCategory,
          accountType: this.$route.params.accountType,
        },
      });
    },
    goToInsights() {
      this.$router.push({
        name: 'insights',
        params: {
          accountId: this.accountId,
        },
      });
    },
    editTransaction(transaction) {
      // Dual transactions can only be edited if they have a linked transaction
      // (added in 1.3.0)
      if (transaction.expense && !transaction.linkedTransaction) {
        return;
      }
      this.transaction = transaction;
      this.editTransactionDialogVisible = true;
    },
    async importTransactions() {
      this.importTransactionsActive = true;
      await this.$ipc.importTransactions(
        importTransactionsFormats.find(
          (format) => format.id === this.account.importTransactionsFormatId
        )
      );
      this.importTransactionsActive = false;
    },
  },
};
</script>
