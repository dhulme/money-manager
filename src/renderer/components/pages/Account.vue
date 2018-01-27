<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="headline">{{ account.name }}</v-card-title>
      <v-card-actions>
        <v-btn flat @click="deleteAccount" color="error">Delete</v-btn>
      </v-card-actions>
    </v-card>

    <transaction-list
      editable
      :account="account"
      :transactions="transactions"
      @transaction-click="editTransaction"
      @add-transaction="addTransaction"
    />

    <v-dialog v-model="dialogVisible" max-width="500px">
      <transaction-edit 
        :transaction="transaction"
        :account="account"
        @close="dialogVisible = false"
        @added="updateTransactions"
      />
    </v-dialog>
  </div>
</template>

<script>
  import TransactionList from '../TransactionList';
  import BackButton from '../BackButton';
  import TransactionEdit from '../TransactionEdit';

  export default {
    components: {
      TransactionList,
      BackButton,
      TransactionEdit,
    },
    data() {
      return {
        dialogVisible: false,
        transaction: {},
        transactions: [],
      };
    },
    computed: {
      account() {
        return this.$store.getters.account(this.accountId);
      },
      accountId() {
        return this.$route.params.accountId;
      },
    },
    created() {
      this.transactions = this.$store.getters.transactions(this.account);
      this.$ipc.setTitle(this.account.name);
    },
    methods: {
      deleteAccount() {
        this.$store.dispatch('deleteAccount', this.accountId);
        this.$router.push({
          name: 'accounts',
        });
      },
      editTransaction(transaction) {
        this.transaction = transaction;
        this.dialogVisible = true;
      },
      addTransaction() {
        this.transaction = {
          date: Date.now(),
        };
        this.dialogVisible = true;
      },
      updateTransactions(transaction) {
        this.transactions.push(transaction);
        this.dialogVisible = false;
      },
    },
  };
</script>