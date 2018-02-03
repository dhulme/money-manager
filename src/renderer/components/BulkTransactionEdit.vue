<template>
  <v-card>
    <v-card-title class="headline">
      Edit Transaction
    </v-card-title>
    <v-card-text>
      <v-select
        :items="accounts"
        v-model="newTransaction.from"
        label="From"
        autocomplete
        prepend-icon="account_balance"
      />
      <v-select
        :items="accounts"
        v-model="newTransaction.to"
        label="To"
        autocomplete
        prepend-icon="account_balance"
      />
      <v-text-field
        v-model="newTransaction.note"
        label="Note"
        prepend-icon="note"
      />
      <v-text-field
        v-model="newTransaction.value"
        label="Amount"
        prefix="£"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn flat @click="$emit('close')">Close</v-btn>
      <v-btn color="primary" flat @click="saveTransaction">Update</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    props: {
      transaction: Object,
    },
    data() {
      return {
        newTransaction: {},
        transactionId: '',
      };
    },
    computed: {
      accounts() {
        return this.$store.getters.accountItems;
      },
    },
    watch: {
      transaction(transaction) {
        this.transactionId = this.$store.getters.bulkTransactionTransactionId(transaction);
        this.newTransaction = {
          ...transaction,
        };
      },
    },
    methods: {
      saveTransaction() {
        this.$store.dispatch('updateBulkTransactionTransaction', {
          transaction: this.newTransaction,
          transactionId: this.transactionId,
        });
        this.$emit('close');
      },
    },
  };
</script>

<style>

</style>
