<template>
  <VCard v-hotkey.close="close">
    <VCardTitle class="headline">
      {{ transaction.id ? 'Edit' : 'Add' }} Transaction
    </VCardTitle>
    <VCardText>
      <VAutocomplete
        :items="accounts"
        v-model="newTransaction.from"
        label="From"
        prepend-icon="account_balance"
      />
      <VAutocomplete
        :items="accounts"
        v-model="newTransaction.to"
        label="To"
        prepend-icon="account_balance"
      />
      <VTextField
        v-model="newTransaction.note"
        label="Note"
        prepend-icon="note"
        @keyup.enter="save"
      />
      <VTextField
        v-model="newTransaction.value"
        label="Amount"
        prefix="£"
        @keyup.enter="save"
      />
    </VCardText>
    <VCardActions>
      <VBtn
        flat
        @click="close"
      >Close</VBtn>
      <VBtn
        color="primary"
        flat
        @click="save"
      >{{ transaction.id ? 'Update' : 'Add' }}</VBtn>
    </VCardActions>
  </VCard>
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
