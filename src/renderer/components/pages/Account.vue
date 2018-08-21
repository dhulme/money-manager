<template>
  <div v-hotkey.close="goToAccountsIfDialogClosed">
    <v-card class="mb-4">
      <v-card-title class="headline">{{ account.name }}</v-card-title>
      <v-card-actions>
        <v-btn
          flat
          color="error"
          @click="deleteAccount"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>

    <transaction-list
      :account="account"
      :transactions="transactions"
      editable
      @add-transaction="addTransaction"
    />

    <v-dialog
      v-model="dialogVisible"
      max-width="500px"
    >
      <transaction-edit
        :transaction="transaction"
        :account="account"
        @close="dialogVisible = false"
        @added="dialogVisible = false"
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
    },
    created() {
      this.$ipc.setTitle(this.account.name);
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
        this.dialogVisible = true;
      },
      goToAccountsIfDialogClosed() {
        if (!this.dialogVisible) {
          this.$router.push({
            name: 'accounts',
          });
        }
      },
    },
  };
</script>
