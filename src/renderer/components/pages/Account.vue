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
      @transaction-click="editTransaction"
      @add-transaction="addTransaction"
    />

    <v-dialog v-model="dialogVisible" max-width="500px">
      <transaction-edit 
        :transaction="transaction"
        :account="account"
        @close="dialogVisible = false"
      />
    </v-dialog>
  </div>
</template>

<script>
  import TransactionList from '@/components/TransactionList';
  import BackButton from '@/components/BackButton';
  import TransactionEdit from '@/components/TransactionEdit';

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
      }
    },
    computed: {
      account() {
        return this.$project.account(this.$route.params.accountId);
      },
    },
    methods: {
      deleteAccount() {
        this.$project.deleteAccount(this.$route.params.accountId);
        this.$router.push({
          name: 'accounts',
        });
      },
      editTransaction(transaction) {
        this.transaction = transaction;
        this.dialogVisible = true;
      },
      addTransaction() {
        this.transaction = {};
        this.dialogVisible = true;
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
