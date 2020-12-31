<template>
  <VCard>
    <VCardTitle class="headline"
      >{{ isNewTransaction ? 'Add' : 'Edit' }} Transaction</VCardTitle
    >
    <VCardText>
      <VForm ref="form" v-model="valid" lazy-validation>
        <VMenu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <VTextField
              v-model="prettyDate"
              label="Date"
              prepend-icon="event"
              readonly
              class="required"
              v-on="on"
            />
          </template>
          <VDatePicker v-model="date" @input="dateMenu = false" />
        </VMenu>

        <VTextField
          ref="description"
          :rules="descriptionValidationRules"
          v-model="newTransaction.description"
          label="Description"
          prepend-icon="description"
          class="required"
          @keyup.enter="save"
        />
        <VTextField
          v-model="newTransaction.note"
          label="Note"
          prepend-icon="note"
          @keyup.enter="save"
        />
        <VAutocomplete
          :items="accounts"
          :rules="accountValidationRules"
          v-model="newTransaction.account"
          label="Account"
          prepend-icon="account_balance"
          class="required"
          :disabled="!isNewTransaction"
        />
        <VTextField
          v-model="newTransaction.valueIn"
          :rules="valueValidationRules"
          label="In"
          :prefix="$currencyPrefix"
          @keyup.enter="save"
          :disabled="!isNewTransaction && isFromTransaction"
        />
        <VTextField
          v-model="newTransaction.valueOut"
          :rules="valueValidationRules"
          label="Out"
          :prefix="$currencyPrefix"
          @keyup.enter="save"
          :disabled="!isNewTransaction && !isFromTransaction"
        />
        <VCheckbox
          v-if="!isNewTransaction"
          v-model="newTransaction.highlighted"
          label="Highlighted"
        />
      </VForm>
    </VCardText>
    <VCardActions>
      <VBtn text @click="close">Close</VBtn>
      <VBtn color="primary" text @click="save">OK</VBtn>
    </VCardActions>
  </VCard>
</template>

<script>
import moment from 'moment';

import { getId, validateInputValue } from '../util';

export default {
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
      dateMenu: false,
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
        (value) => this.formClean || !!value || 'Transaction date is required',
      ],
      descriptionValidationRules: [
        (value) =>
          this.formClean || !!value || 'Transaction description is required',
      ],
      accountValidationRules: [
        (value) =>
          this.formClean || !!value || 'Transaction account is required',
      ],
      date: moment().format('YYYY-MM-DD'),
      prettyDate: moment().format(this.$dateFormat),
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
        this.date = moment(transaction.date).format('YYYY-MM-DD');
        this.$nextTick(() => {
          this.prettyDate = moment(transaction.date).format(this.$dateFormat);
          this.$nextTick(() => {
            this.$refs.description.focus();
          });
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
    date: {
      handler(date) {
        this.prettyDate = moment(date, 'YYYY-MM-DD').format(this.$dateFormat);
      },
    },
  },
  methods: {
    save() {
      this.formClean = false;
      if (!this.$refs.form.validate()) {
        return;
      }

      this.$emit(
        this.isNewTransaction ? 'added' : 'updated',
        this.isNewTransaction ? this.add() : this.update()
      );
    },
    getTransactionFromUi() {
      const uiTransaction = this.newTransaction;
      const date = moment(this.date);
      return {
        ...uiTransaction,
        date: moment()
          .set({
            year: date.year(),
            month: date.month(),
            date: date.date(),
          })
          .toDate(),
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
