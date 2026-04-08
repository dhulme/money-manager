<template>
  <div v-hotkey.close="goToBulkTransactions">
    <v-card class="mb-4">
      <v-card-title
        ><span class="text-h6">New Bulk Transaction</span><v-spacer /><v-btn
          variant="text"
          @click="importTransactions"
          >Import</v-btn
        ></v-card-title
      >
      <v-card-text>
        <v-form ref="mainForm" v-model="mainFormValid" lazy-validation>
          <v-text-field
            v-model="name"
            label="Name"
            class="required"
            :rules="mainFormNameRules"
          />
          <v-text-field v-model="description" label="Description" />
        </v-form>
      </v-card-text>
    </v-card>
    <v-card class="mb-4">
      <v-card-title>Add Transaction</v-card-title>
      <v-form
        ref="newTransactionForm"
        lazy-validation
        v-model="newTransactionFormValid"
        @submit.prevent="addTransaction"
      >
        <v-card-text>
          <v-text-field
            v-model="newTransaction.value"
            label="Amount"
            :prefix="$currencyPrefix"
            class="required"
            :rules="newTransactionValueValidationRules"
          />
          <v-autocomplete
            :items="projectItems"
            v-model="newTransaction.from"
            label="From"
            class="required"
            :rules="newTransactionValueFromRules"
            auto-select-first
          />

          <v-autocomplete
            :items="projectItems"
            v-model="newTransaction.to"
            label="To"
            class="required"
            :rules="newTransactionValueToRules"
            auto-select-first
          />

          <v-text-field v-model="newTransaction.note" placeholder="Note" />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" color="primary" type="submit">Add</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <v-card>
      <v-card-title>Transactions</v-card-title>
      <BulkTransactionTransactions
        :transactions="transactions"
        @transaction-click="editTransaction"
      />
    </v-card>
    <v-row class="mt-4 ml-4">
      <v-btn color="primary" @click="addBulkTransaction">OK</v-btn>
    </v-row>

    <v-dialog v-model="dialogVisible">
      <BulkTransactionEdit
        :transaction="editedTransaction"
        @saved="saveEditedTransaction"
        @deleted="deleteEditedTransaction"
        @close="dialogVisible = false"
      />
    </v-dialog>
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
    const { name, description, transactions } =
      this.$store.state.newBulkTransaction;
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
        title: account.name,
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
