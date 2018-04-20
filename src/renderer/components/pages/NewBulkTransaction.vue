<template>
  <div v-hotkey.close="goToBulkTransactions">
    <v-card class="mb-4">
      <v-card-title class="headline">New Bulk Transaction</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Name"
        />
        <v-text-field
          v-model="description"
          label="Description"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          flat
          color="secondary"
          @click="addBulkTransaction"
        >Done</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="mb-4">
      <v-card-title>Add Transaction</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newTransaction.value" 
          label="Amount"
          prefix="£"
        />
        <v-select
          :items="projectItems"
          v-model="newTransaction.from"
          label="From"
          autocomplete
        />

        <v-select
          :items="projectItems"
          v-model="newTransaction.to"
          label="To"
          autocomplete
        />

        <v-text-field
          v-model="newTransaction.note"
          placeholder="Note"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn flat color="primary" @click="addTransaction">Add</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>Transactions</v-card-title>
      <bulk-transaction-transactions
        :transactions="transactions"
      />
    </v-card>
  </div>
</template>

<script>
  import BulkTransactionTransactions from '../BulkTransactionTransactions';

  export default {
    components: {
      BulkTransactionTransactions,
    },
    data() {
      return {
        name: '',
        description: '',
        newTransaction: {},
        transactions: [],
      };
    },
    computed: {
      projectItems() {
        return this.$store.getters['project/accounts'].map(account => ({
          text: account.name,
          value: account.id,
        }));
      },
    },
    watch: {
      name(name) {
        this.$ipc.setTitle(name);
      },
    },
    methods: {
      addTransaction() {
        this.transactions.push(this.newTransaction);
        this.newTransaction = {};
      },
      addBulkTransaction() {
        this.$store.dispatch('project/addBulkTransaction', {
          name: this.name,
          description: this.description,
          transactions: this.transactions,
        });

        this.$router.push({
          name: 'bulkTransactions',
        });
      },
      goToBulkTransactions() {
        this.$router.push({
          name: 'bulkTransactions',
        });
      },
    },
  };
</script>
