<template>
  <v-card v-hotkey.close="close">
    <v-card-title class="headline">
      {{ transaction.id ? 'Edit' : 'Add' }} Transaction
    </v-card-title>
    <v-card-text>
      <v-autocomplete
        :items="accounts"
        v-model="newTransaction.from"
        label="From"
        prepend-icon="account_balance"
      />
      <v-autocomplete
        :items="accounts"
        v-model="newTransaction.to"
        label="To"
        prepend-icon="account_balance"
      />
      <v-text-field
        v-model="newTransaction.note"
        label="Note"
        prepend-icon="note"
        @keyup.enter="save"
      />
      <v-text-field
        v-model="newTransaction.value"
        label="Amount"
        prefix="£"
        @keyup.enter="save"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        flat
        @click="close"
      >Close</v-btn>
      <v-btn
        color="primary"
        flat
        @click="save"
      >{{ transaction.id ? 'Update' : 'Add' }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import util from '../util';

  export default {
    props: {
      transaction: {
        type: Object,
        required: true,
      },
      bulkTransaction: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        newTransaction: {},
      };
    },
    computed: {
      accounts() {
        return this.$store.getters['project/accountItems'];
      },
    },
    watch: {
      transaction(transaction) {
        this.newTransaction = {
          ...transaction,
        };
      },
    },
    methods: {
      save() {
        if (this.transaction.id) {
          this.$store.dispatch('project/updateBulkTransactionTransaction', {
            transaction: this.newTransaction,
            bulkTransaction: this.bulkTransaction,
          });
        } else {
          this.newTransaction.id = util.getId();
          this.$store.dispatch('project/addBulkTransactionTransaction', {
            transaction: this.newTransaction,
            bulkTransaction: this.bulkTransaction,
          });
        }

        this.$emit('saved', this.newTransaction);
      },
      close() {
        this.$emit('close');
      },
    },
  };
</script>

<style>

</style>
