<template>
  <div v-hotkey.close="goToBulkTransactions">
    <VCard class="mb-4">
      <VCardTitle
        ><span class="headline">New Bulk Transaction</span><VSpacer /><VBtn
          text
          @click="importTransactions"
          >Import</VBtn
        ></VCardTitle
      >
      <VCardText>
        <VForm ref="mainForm" v-model="mainFormValid" lazy-validation>
          <VTextField
            v-model="name"
            label="Name"
            class="required"
            :rules="mainFormNameRules"
          />
          <VTextField v-model="description" label="Description" />
        </VForm>
      </VCardText>
    </VCard>
    <VCard class="mb-4">
      <VCardTitle>Add Transaction</VCardTitle>
      <VForm
        ref="newTransactionForm"
        lazy-validation
        v-model="newTransactionFormValid"
        @submit.prevent="addTransaction"
      >
        <VCardText>
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
        </VCardText>
        <VCardActions>
          <VBtn text color="primary" type="submit">Add</VBtn>
        </VCardActions>
      </VForm>
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
import importBulkTransactions from './importBulkTransactions';

import { getId, validateInputValue } from '../../util';

export default {
  components: {
    BulkTransactionTransactions,
    BulkTransactionEdit,
  },
  mixins: [importBulkTransactions],
  data() {
    const {
      name,
      description,
      transactions,
    } = this.$store.state.newBulkTransaction;
    return {
      name,
      description,
      newTransaction: {
        id: getId(),
      },
      transactions,
      editedTransaction: {
        id: null,
        from: '',
        to: '',
        value: 0,
        note: '',
      },
      dialogVisible: false,
      newTransactionFormValid: true,
      newTransactionFormClean: true,
      newTransactionValueValidationRules: [
        (value) =>
          this.newTransactionFormClean || !!value || 'Amount is required',
        (value) => this.newTransactionFormClean || validateInputValue(value),
      ],
      newTransactionValueFromRules: [
        (value) =>
          this.newTransactionFormClean || !!value || 'From account is required',
      ],
      newTransactionValueToRules: [
        (value) =>
          this.newTransactionFormClean || !!value || 'To account is required',
      ],
      mainFormValid: true,
      mainFormClean: true,
      mainFormNameRules: [
        (value) => this.mainFormClean || !!value || 'Name is required',
      ],
    };
  },
  computed: {
    projectItems() {
      return this.$store.getters['project/accounts'].map((account) => ({
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
      this.newTransactionFormClean = false;
      if (this.$refs.newTransactionForm.validate()) {
        this.newTransactionFormClean = true;
        this.transactions.push(this.newTransaction);
        this.newTransaction = {
          id: getId(),
        };
        this.$refs.newTransactionForm.resetValidation();
      }
    },
    addBulkTransaction() {
      this.mainFormClean = false;
      if (!this.$refs.mainForm.validate()) {
        return;
      }

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
      if (!this.$store.state.dialog) {
        this.$router.push({
          name: 'bulkTransactions',
        });
      }
    },
    editTransaction(transaction) {
      this.editedTransaction = transaction;
      this.dialogVisible = true;
    },
    saveEditedTransaction(transaction) {
      this.dialogVisible = false;
      const index = this.transactions.findIndex((_) => _.id === transaction.id);
      this.transactions.splice(index, 1, transaction);
    },
    deleteEditedTransaction(transaction) {
      this.dialogVisible = false;
      const index = this.transactions.findIndex((_) => _.id === transaction.id);
      this.transactions.splice(index, 1);
    },
  },
};
</script>
