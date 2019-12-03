<template>
  <div v-hotkey.close="goToBulkTransactions">
    <VCard class="mb-4">
      <VCardTitle class="headline">New Bulk Transaction</VCardTitle>
      <VCardText>
        <VTextField v-model="name" label="Name" />
        <VTextField v-model="description" label="Description" />
      </VCardText>
    </VCard>
    <VCard class="mb-4">
      <VCardTitle>Add Transaction</VCardTitle>
      <VCardText>
        <VForm
          ref="newTransactionForm"
          lazy-validation
          v-model="newTransactionFormValid"
        >
          <VTextField
            v-model="newTransaction.value"
            label="Amount"
            :prefix="$currencyPrefix"
            class="required"
            :rules="newTransactionValueValidationRules"
          />
          <VAutocomplete
            :items="projectItems"
            v-model="newTransaction.from"
            label="From"
            class="required"
            :rules="newTransactionValueFromRules"
          />

          <VAutocomplete
            :items="projectItems"
            v-model="newTransaction.to"
            label="To"
            class="required"
            :rules="newTransactionValueToRules"
          />

          <VTextField v-model="newTransaction.note" placeholder="Note" />
        </VForm>
      </VCardText>
      <VCardActions>
        <VBtn text color="primary" @click="addTransaction">Add</VBtn>
      </VCardActions>
    </VCard>
    <VCard>
      <VCardTitle>Transactions</VCardTitle>
      <BulkTransactionTransactions
        :transactions="transactions"
        @transaction-click="editTransaction"
      />
    </VCard>
    <VRow class="mt-4 ml-4">
      <VBtn color="primary" @click="addBulkTransaction">OK</VBtn>
    </VRow>

    <VDialog v-model="dialogVisible">
      <BulkTransactionEdit
        :transaction="editedTransaction"
        @saved="saveEditedTransaction"
        @deleted="deleteEditedTransaction"
        @close="dialogVisible = false"
      />
    </VDialog>
  </div>
</template>

<script>
import BulkTransactionTransactions from '../BulkTransactionTransactions.vue';
import BulkTransactionEdit from '../BulkTransactionEdit.vue';

import { getId } from '../../util';

export default {
  components: {
    BulkTransactionTransactions,
    BulkTransactionEdit
  },
  data() {
    const {
      name,
      description,
      transactions
    } = this.$store.state.newBulkTransaction;
    return {
      name,
      description,
      newTransaction: {
        id: getId()
      },
      transactions,
      editedTransaction: {
        id: null,
        from: '',
        to: '',
        value: 0,
        note: ''
      },
      dialogVisible: false,
      newTransactionFormValid: true,
      newTransactionFormClean: true,
      newTransactionValueValidationRules: [
        value => this.newTransactionFormClean || !!value || 'Value is required',
        value =>
          this.newTransactionFormClean ||
          !Number.isNaN(Number(value)) ||
          'Value must be a number'
      ],
      newTransactionValueFromRules: [
        value =>
          this.newTransactionFormClean || !!value || 'From account is required'
      ],
      newTransactionValueToRules: [
        value =>
          this.newTransactionFormClean || !!value || 'To account is required'
      ]
    };
  },
  computed: {
    projectItems() {
      return this.$store.getters['project/accounts'].map(account => ({
        text: account.name,
        value: account.id
      }));
    }
  },
  watch: {
    name(name) {
      this.$ipc.setTitle(name);
    }
  },
  methods: {
    addTransaction() {
      this.newTransactionFormClean = false;
      if (this.$refs.newTransactionForm.validate()) {
        this.newTransactionFormClean = true;
        this.transactions.push(this.newTransaction);
        this.newTransaction = {
          id: getId()
        };
        this.$refs.newTransactionForm.resetValidation();
      }
    },
    addBulkTransaction() {
      this.$store.dispatch('project/addBulkTransaction', {
        name: this.name,
        description: this.description,
        transactions: this.transactions
      });

      this.$router.push({
        name: 'bulkTransactions'
      });
    },
    goToBulkTransactions() {
      if (!this.$store.state.dialog) {
        this.$router.push({
          name: 'bulkTransactions'
        });
      }
    },
    editTransaction(transaction) {
      this.editedTransaction = transaction;
      this.dialogVisible = true;
    },
    saveEditedTransaction(transaction) {
      this.dialogVisible = false;
      const index = this.transactions.findIndex(_ => _.id === transaction.id);
      this.transactions.splice(index, 1, transaction);
    },
    deleteEditedTransaction(transaction) {
      this.dialogVisible = false;
      const index = this.transactions.findIndex(_ => _.id === transaction.id);
      this.transactions.splice(index, 1);
    }
  }
};
</script>
