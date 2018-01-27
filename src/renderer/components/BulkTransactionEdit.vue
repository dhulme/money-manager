<template>
  <v-card>
    <v-card-title class="headline">
      Edit Transaction
    </v-card-title>
    <v-card-text>
      <v-select
        :items="accounts"
        v-model="transaction.from"
        label="From"
        autocomplete
        prepend-icon="account_balance"
      />
      <v-select
        :items="accounts"
        v-model="transaction.to"
        label="To"
        autocomplete
        prepend-icon="account_balance"
      />
      <v-text-field
        v-model="transaction.note"
        label="Note"
        prepend-icon="note"
      />
      <v-text-field
        v-model="transaction.value"
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
    computed: {
      accounts() {
        return this.$store.getters.accounts.map(account => ({
          text: account.name,
          id: account.id,
        }));
      },
    },
    methods: {
      saveTransaction() {
        
      },
    },
  };
</script>

<style>

</style>
