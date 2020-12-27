<template>
  <div v-hotkey.close="closeDialog">
    <VCard class="mb-4">
      <VCardTitle class="headline">{{ account.name }}</VCardTitle>
      <VCardActions>
        <VBtn text color="error" @click="deleteAccount">Delete</VBtn>
        <VBtn text @click="goToEditAccount">Edit</VBtn>
        <VBtn
          v-if="account.importTransactionsFormatId"
          text
          @click="importTransactions"
          >Import</VBtn
        >
      </VCardActions>
    </VCard>

    <TransactionList
      :account="account"
      :transactions="transactions"
      @edit-transaction="editTransaction"
      @add-transaction="addTransaction"
    />

    <VDialog
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
    </VDialog>

    <VDialog
      v-model="importTransactionsDialogVisible"
      persistent
      no-click-animation
    >
      <ImportTransactions
        :account="account"
        @close="importTransactionsDialogVisible = false"
      />
    </VDialog>
  </div>
</template>

<script>
import TransactionList from '../TransactionList';
import TransactionEdit from '../TransactionEdit';
import ImportTransactions from '../ImportTransactions';
import { importTransactionsFormats } from '../../import-transactions';

export default {
  components: {
    TransactionList,
    TransactionEdit,
    ImportTransactions,
  },
  data() {
    return {
      editTransactionDialogVisible: false,
      importTransactionsDialogVisible: false,
      transaction: {},
      importTransactionsActive: false,
    };
  },
  computed: {
    account() {
      return this.$store.getters['project/account'](this.accountId);
    },
    transactions() {
      return this.$store.getters['project/transactions'](this.account);
    },
    accountId() {
      return this.$route.params.accountId;
    },
    importedTransactions() {
      return this.$store.state.importedTransactions;
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
      this.$store.dispatch('project/deleteAccount', this.accountId);
      this.$router.push({
        name: 'accounts',
      });
    },
    addTransaction() {
      this.transaction = {};
      this.editTransactionDialogVisible = true;
    },
    closeDialog() {
      if (
        this.$store.state.dialog ||
        this.editTransactionDialogVisible ||
        this.importTransactionsDialogVisible ||
        this.importTransactionsActive
      ) {
        this.editTransactionDialogVisible = false;
        this.importTransactionsDialogVisible = false;
      } else {
        this.$store.commit('setSearch', '');
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
