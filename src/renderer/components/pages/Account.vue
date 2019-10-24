<template>
  <div v-hotkey.close="goToAccountsIfDialogClosed">
    <VCard class="mb-4">
      <VCardTitle class="headline">{{ account.name }}</VCardTitle>
      <VCardActions>
        <VBtn text color="error" @click="deleteAccount">Delete</VBtn>
        <VBtn text @click="goToEditAccount">Edit</VBtn>
        <VBtn text @click="importTransactions">Import</VBtn>
      </VCardActions>
    </VCard>

    <TransactionList
      :account="account"
      :transactions="transactions"
      @highlight-transaction="highlightTransaction"
      @add-transaction="addTransaction"
    />

    <VDialog v-model="editTransactionDialogVisible" max-width="500px">
      <TransactionEdit
        :transaction="transaction"
        :account="account"
        @close="editTransactionDialogVisible = false"
        @added="editTransactionDialogVisible = false"
      />
    </VDialog>

    <VDialog v-model="importTransactionsDialogVisible">
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

export default {
  components: {
    TransactionList,
    TransactionEdit,
    ImportTransactions
  },
  data() {
    return {
      editTransactionDialogVisible: false,
      importTransactionsDialogVisible: false,
      transaction: {}
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
    }
  },
  created() {
    this.$ipc.setTitle(this.account.name);
  },
  watch: {
    importedTransactions(value) {
      if (value.length) {
        this.importTransactionsDialogVisible = true;
      }
    }
  },
  methods: {
    deleteAccount() {
      this.$store.dispatch('project/deleteAccount', this.accountId);
      this.$router.push({
        name: 'accounts'
      });
    },
    addTransaction() {
      this.transaction = {};
      this.editTransactionDialogVisible = true;
    },
    goToAccountsIfDialogClosed() {
      if (!this.editTransactionDialogVisible) {
        this.$router.push({
          name: 'accounts'
        });
      }
    },
    goToEditAccount() {
      this.$router.push({
        name: 'editAccount',
        params: {
          accountId: this.accountId,
          accountCategory: this.$route.params.accountCategory,
          accountType: this.$route.params.accountType
        }
      });
    },
    highlightTransaction(transaction) {
      transaction.highlighted = !transaction.highlighted;
      this.$store.dispatch('project/updateTransaction', transaction);
    },
    importTransactions() {
      console.log('to send to ipc', this.account);
      this.$ipc.importTransactions(this.account.importTransactionsFormatId);
    }
  }
};
</script>
