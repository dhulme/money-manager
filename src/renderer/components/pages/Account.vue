<template>
  <div v-hotkey.close="closeDialog">
    <VCard class="mb-4">
      <VCardTitle class="headline">{{ account.name }}</VCardTitle>
      <VCardActions>
        <VBtn text color="error" @click="deleteAccount">Delete</VBtn>
        <VBtn text @click="goToEditAccount">Edit</VBtn>
        <VBtn text @click="goToInsights">Insights</VBtn>
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
        :visible="importTransactionsDialogVisible"
      />
    </VDialog>

    <VDialog v-model="cannotDeleteAccountDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Cannot delete account</VCardTitle>
        <VCardText
          >You can only delete an account if the balance is zero.</VCardText
        >
        <VCardActions>
          <VBtn
            text
            color="primary"
            @click="cannotDeleteAccountDialogVisible = false"
            >Ok</VBtn
          >
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script>
import Big from 'big.js';
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
      cannotDeleteAccountDialogVisible: false,
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
      if (new Big(this.account.balance).eq(0)) {
        this.$store.dispatch('project/deleteAccount', this.accountId);
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
