<template>
  <VCard v-hotkey.close="close">
    <VCardTitle class="headline"
      >{{ isNewTransaction ? 'Add' : 'Edit' }} Transaction</VCardTitle
    >
    <VCardText>
      <VForm ref="form" v-model="valid" lazy-validation>
        <VMenu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
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
              v-on="on"
              required
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
          required
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
          required
          @keyup.enter="save"
        />
        <VTextField
          v-model="newTransaction.valueIn"
          :rules="valueValidationRules"
          label="In"
          :prefix="$currencyPrefix"
          @keyup.enter="save"
        />
        <VTextField
          v-model="newTransaction.valueOut"
          :rules="valueValidationRules"
          label="Out"
          :prefix="$currencyPrefix"
          @keyup.enter="save"
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

import { getId } from '../util';

export default {
  props: {
    transaction: {
      type: Object,
      default: null
    },
    account: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      newTransaction: {},
      dateMenu: false,
      valid: false,
      valueValidationRules: [
        () => {
          const value =
            this.newTransaction.valueIn || this.newTransaction.valueOut;
          if (value === undefined) {
            return 'A value for in or out is required';
          }
          if (Number.isNaN(Number(value))) {
            return 'Value must be a number';
          }
          return true;
        }
      ],
      dateValidationRules: [value => !!value || 'Transaction date is required'],
      descriptionValidationRules: [
        value => !!value || 'Transaction description is required'
      ],
      accountValidationRules: [
        value => !!value || 'Transaction account is required'
      ],
      date: null,
      prettyDate: null
    };
  },
  computed: {
    isNewTransaction() {
      return !this.transaction.account;
    },
    accounts() {
      return this.$store.getters['project/accountItems'].filter(
        account => account.value !== this.account.id
      );
    }
  },
  watch: {
    transaction(transaction) {
      this.$refs.form.reset();
      this.$refs.description.focus();
      this.newTransaction = {
        ...transaction
      };
      this.date = moment().format('YYYY-MM-DD');
      if (transaction.from === this.account.id) {
        this.newTransaction.valueOut = transaction.value;
        this.newTransaction.account = transaction.to;
      } else {
        this.newTransaction.valueIn = transaction.value;
        this.newTransaction.account = transaction.from;
      }
    },
    date: {
      handler(date) {
        this.prettyDate = moment(date, 'YYYY-MM-DD').format(this.$dateFormat);
      }
    }
  },
  methods: {
    save() {
      if (!this.$refs.form.validate()) {
        return;
      }

      const uiTransaction = this.newTransaction;
      const date = moment(this.date);
      const transactionAccount = this.$store.getters['project/account'](
        uiTransaction.account
      );
      const transaction = {
        description: uiTransaction.description,
        note: uiTransaction.note,
        date: moment()
          .set({
            year: date.year(),
            month: date.month(),
            date: date.date()
          })
          .toDate(),
        id: getId(),
        value: uiTransaction.valueIn || uiTransaction.valueOut
      };

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
          id: getId()
        };
        if (uiTransaction.valueIn) {
          transaction.from = 'none';
          transaction.to = this.account.id;
          this.$store.dispatch('project/addDualTransaction', {
            primary: transaction,
            secondary: {
              ...secondaryTransaction,
              from: 'none',
              to: uiTransaction.account
            }
          });
        } else {
          transaction.from = this.account.id;
          transaction.to = 'none';
          this.$store.dispatch('project/addDualTransaction', {
            primary: transaction,
            secondary: {
              ...secondaryTransaction,
              to: 'none',
              from: uiTransaction.account
            }
          });
        }
      }

      const event = this.isNewTransaction ? 'added' : 'updated';
      this.$emit(event, transaction);
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>
