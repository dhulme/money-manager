<template>
  <div v-hotkey.close="goToAccountsIfDialogClosed">
    <VCard class="mb-4">
      <VCardTitle class="headline">{{ account.name }}</VCardTitle>
      <VCardActions>
        <VBtn text color="error" @click="deleteAccount">Delete</VBtn>
      </VCardActions>
    </VCard>

    <TransactionList
      :account="account"
      :transactions="transactions"
      @highlight-transaction="highlightTransaction"
      @add-transaction="addTransaction"
    />

    <VDialog v-model="dialogVisible" max-width="500px">
      <TransactionEdit
        :transaction="transaction"
        :account="account"
        @close="dialogVisible = false"
        @added="dialogVisible = false"
      />
    </VDialog>
  </div>
</template>

<script>
import TransactionList from '../TransactionList';
import TransactionEdit from '../TransactionEdit';

export default {
  components: {
    TransactionList,
    TransactionEdit
  },
  data() {
    return {
      dialogVisible: false,
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
    }
  },
  created() {
    this.$ipc.setTitle(this.account.name);
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
      this.dialogVisible = true;
    },
    goToAccountsIfDialogClosed() {
      if (!this.dialogVisible) {
        this.$router.push({
          name: 'accounts'
        });
      }
    },
    highlightTransaction(transaction) {
      transaction.highlighted = !transaction.highlighted;
      this.$store.dispatch('project/updateTransaction', transaction);
    }
  }
};
</script>
