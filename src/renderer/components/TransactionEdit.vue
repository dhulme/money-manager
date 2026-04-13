<template>
  <v-card>
    <v-card-title class="text-h6 mt-2"
      >{{ isNewTransaction ? 'Add' : 'Edit' }} Transaction</v-card-title
    >
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-date-input
          v-model="date"
          label="Date"
          prepend-icon="mdi-calendar"
          :rules="dateValidationRules"
          class="required"
        />

        <v-text-field
          ref="description"
          :rules="descriptionValidationRules"
          v-model="newTransaction.description"
          label="Description"
          prepend-icon="mdi-text"
          class="required"
          @keyup.enter="save"
        />
        <v-text-field
          v-model="newTransaction.note"
          label="Note"
          prepend-icon="mdi-note"
          @keyup.enter="save"
        />
        <v-autocomplete
          :items="accounts"
          :rules="accountValidationRules"
          v-model="newTransaction.account"
          label="Account"
          prepend-icon="mdi-bank"
          class="required"
          :disabled="!isNewTransaction"
          auto-select-first
        />
        <v-text-field
          v-model="newTransaction.valueIn"
          :rules="valueValidationRules"
          label="In"
          :prefix="$currencyPrefix"
          @keyup.enter="save"
          :disabled="!isNewTransaction && isFromTransaction"
        />
        <v-text-field
          v-model="newTransaction.valueOut"
          :rules="valueValidationRules"
          label="Out"
          :prefix="$currencyPrefix"
          @keyup.enter="save"
          :disabled="!isNewTransaction && !isFromTransaction"
        />
        <v-checkbox
          v-if="!isNewTransaction"
          v-model="newTransaction.highlighted"
          label="Highlighted"
          density="compact"
        />
        <v-checkbox
          v-model="newTransaction.giftAided"
          label="Gift Aided"
          density="compact"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" @click="close">Close</v-btn>
      <v-btn color="primary" variant="text" @click="save">OK</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { VDateInput } from 'vuetify/labs/VDateInput';
import { getId, validateInputValue } from '../util';

export default {
  components: { VDateInput },
  props: {
    transaction: {
      type: Object,
      default: null,
    },
    account: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      newTransaction: {},
      valid: true,
      formClean: true,
      valueValidationRules: [
        () => {
          if (this.formClean) {
            return true;
          }
          const value =
            this.newTransaction.valueIn || this.newTransaction.valueOut;
          if (value === undefined) {
            return 'A value for in or out is required';
          }
          return validateInputValue(value);
        },
      ],
      dateValidationRules: [
        (value) => this.formClean || (value instanceof Date && !isNaN(value)) || 'Transaction date is required',
      ],
      descriptionValidationRules: [
        (value) =>
          this.formClean || !!value || 'Transaction description is required',
      ],
      accountValidationRules: [
        (value) =>
          this.formClean || !!value || 'Transaction account is required',
      ],
      date: new Date(),
    };
  },
  computed: {
    isNewTransaction() {
      return !this.transaction.id;
    },
    accounts() {
      return this.$store.getters['project/accountItems'].filter(
        (account) => account.value !== this.account.id
      );
    },
    isFromTransaction() {
      return this.transaction.from === this.account.id;
    },
  },
  watch: {
    transaction: {
      immediate: true,
      handler(transaction) {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
          this.formClean = true;
        }
        this.date = transaction.date
          ? new Date(transaction.date)
          : new Date();
        this.$nextTick(() => {
          if (this.$refs.description) {
            this.$refs.description.focus();
          }
        });
        const isFromTransaction = transaction.from === this.account.id;
        this.newTransaction = {
          ...transaction,
          account: transaction.linkedTransaction
            ? transaction.expense
            : isFromTransaction
            ? transaction.to
            : transaction.from,
          ...(isFromTransaction && { valueOut: transaction.value }),
          ...(!isFromTransaction && { valueIn: transaction.value }),
        };
      },
    },
  },
  methods: {
    async save() {
      this.formClean = false;
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }

      this.$emit(
        this.isNewTransaction ? 'added' : 'updated',
        this.isNewTransaction ? this.add() : this.update()
      );
    },
    getTransactionFromUi() {
      const uiTransaction = this.newTransaction;
      const d = this.date;
      return {
        ...uiTransaction,
        date: new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          new Date().getHours(),
          new Date().getMinutes(),
          new Date().getSeconds()
        ),
        id: uiTransaction.id || getId(),
        value: uiTransaction.valueIn || uiTransaction.valueOut,
      };
    },
    update() {
      const uiTransaction = this.getTransactionFromUi();

      const transaction = this.$store.getters['project/transaction'](
        uiTransaction.id
      );
      const updates = {
        description: uiTransaction.description,
        note: uiTransaction.note,
        value: uiTransaction.value,
        date: uiTransaction.date,
        highlighted: uiTransaction.highlighted,
        giftAided: uiTransaction.giftAided,
      };
      const updatedTransaction = {
        ...transaction,
        ...updates,
      };

      if (transaction.linkedTransaction) {
        const linkedTransaction = this.$store.getters['project/transaction'](
          transaction.linkedTransaction
        );

        this.$store.dispatch('project/updateDualTransaction', {
          primary: updatedTransaction,
          secondary: {
            ...linkedTransaction,
            ...updates,
          },
        });
      } else {
        this.$store.dispatch('project/updateTransaction', updatedTransaction);
      }

      return transaction;
    },
    add() {
      const uiTransaction = this.newTransaction;
      const transactionAccount = this.$store.getters['project/account'](
        uiTransaction.account
      );
      const transaction = this.getTransactionFromUi();

      if (
        parseFloat(uiTransaction.valueIn) < 0 ||
        parseFloat(uiTransaction.valueOut) < 0
      ) {
        throw new Error(
          this.$store.commit('setError', 'You cannot enter negative numbers')
        );
      }
      if (uiTransaction.valueIn && uiTransaction.valueOut) {
        throw new Error(
          this.$store.commit(
            'setError',
            'A transaction cannot be both in and out'
          )
        );
      }
      if (!uiTransaction.valueIn && !uiTransaction.valueOut) {
        throw new Error(
          this.$store.commit('setError', 'A transaction must have a value')
        );
      }

      if (transactionAccount.type === this.account.type) {
        if (uiTransaction.valueIn) {
          transaction.from = uiTransaction.account;
          transaction.to = this.account.id;
        } else {
          transaction.from = this.account.id;
          transaction.to = uiTransaction.account;
        }
        this.$store.dispatch('project/addTransaction', transaction);
      } else {
        transaction.expense = uiTransaction.account;
        const secondaryTransaction = {
          ...transaction,
          expense: this.account.id,
          id: getId(),
          linkedTransaction: transaction.id,
        };
        transaction.linkedTransaction = secondaryTransaction.id;
        if (uiTransaction.valueIn) {
          transaction.from = 'none';
          transaction.to = this.account.id;
          this.$store.dispatch('project/addDualTransaction', {
            primary: transaction,
            secondary: {
              ...secondaryTransaction,
              from: 'none',
              to: uiTransaction.account,
            },
          });
        } else {
          transaction.from = this.account.id;
          transaction.to = 'none';
          this.$store.dispatch('project/addDualTransaction', {
            primary: transaction,
            secondary: {
              ...secondaryTransaction,
              to: 'none',
              from: uiTransaction.account,
            },
          });
        }
      }

      return transaction;
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>
