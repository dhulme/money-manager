<template>
  <v-card v-hotkey.close="close">
    <v-card-title class="headline">
      {{ isNewTransaction ? 'Add' : 'Edit' }} Transaction
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-menu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="newTransaction.prettyDate"
            :rules="dateValidationRules"
            label="Date"
            prepend-icon="event"
            readonly
            required
          />
          <v-date-picker
            v-model="date"
            no-title
            scrollable
            @input="newTransaction.prettyDate = $options.filters.date($event)"
          >
            <v-spacer/>
            <v-btn
              flat
              color="primary"
              @click="dateMenu = false"
            >OK</v-btn>
          </v-date-picker>
        </v-menu>

        <v-text-field
          ref="description"
          :rules="descriptionValidationRules"
          v-model="newTransaction.description"
          label="Description"
          prepend-icon="description"
          required
          @keyup.enter="save"
        />
        <v-text-field
          v-model="newTransaction.note"
          label="Note"
          prepend-icon="note"
          @keyup.enter="save"
        />
        <v-select
          :items="accounts"
          :rules="accountValidationRules"
          v-model="newTransaction.account"
          label="Account"
          autocomplete
          prepend-icon="account_balance"
          required
          @keyup.enter="save"
        />
        <v-text-field
          v-model="newTransaction.valueIn"
          :rules="valueValidationRules"
          label="In"
          prefix="£"
          @keyup.enter="save"
        />
        <v-text-field
          v-model="newTransaction.valueOut"
          :rules="valueValidationRules"
          label="Out"
          prefix="£"
          @keyup.enter="save"
        />
      </v-form>
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
      >OK</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import moment from 'moment';

  import util from '../util';

  export default {
    props: {
      transaction: Object,
      account: Object,
    },
    data() {
      return {
        newTransaction: {},
        dateMenu: false,
        valid: false,
        valueValidationRules: [
          () => {
            if (this.newTransaction.valueOut !== undefined || this.newTransaction.valueIn !== undefined) {
              return true;
            }
            return 'A value for in or out is required';
          },
        ],
        dateValidationRules: [
          value => !!value || 'Transaction date is required',
        ],
        descriptionValidationRules: [
          value => !!value || 'Transaction description is required',
        ],
        accountValidationRules: [
          value => !!value || 'Transaction account is required',
        ],
        date: null,
      };
    },
    computed: {
      isNewTransaction() {
        return !this.transaction.account;
      },
      accounts() {
        return this.$store.getters.accountItems.filter(account => account.value !== this.account.id);
      },
    },
    watch: {
      transaction(transaction) {
        this.$refs.form.reset();
        this.$refs.description.focus();
        this.newTransaction = {
          ...transaction,
          prettyDate: this.$options.filters.date(transaction.date),
        };
        if (transaction.from === this.account.id) {
          this.newTransaction.valueOut = transaction.value;
          this.newTransaction.account = transaction.to;
        } else {
          this.newTransaction.valueIn = transaction.value;
          this.newTransaction.account = transaction.from;
        }
      },
    },
    methods: {
      save() {
        if (!this.$refs.form.validate()) {
          return;
        }

        const uiTransaction = this.newTransaction;
        const transactionAccount = this.$store.getters.account(uiTransaction.account);
        const transaction = {
          description: uiTransaction.description,
          note: uiTransaction.note,
          date: moment(uiTransaction.date),
          id: util.getId(),
        };

        if (parseFloat(uiTransaction.valueIn) < 0 || parseFloat(uiTransaction.valueOut) < 0) {
          throw new Error(this.$store.commit('setError', 'You cannot enter negative numbers'));
        }
        if (uiTransaction.valueIn && uiTransaction.valueOut) {
          throw new Error(this.$store.commit('setError', 'A transaction cannot be both in and out'));
        }
        if (!uiTransaction.valueIn && !uiTransaction.valueOut) {
          throw new Error(this.$store.commit('setError', 'A transaction must have a value'));
        }

        if (transactionAccount.type === this.account.type) {
          if (uiTransaction.valueIn) {
            transaction.value = uiTransaction.valueIn;
            transaction.from = uiTransaction.account;
            transaction.to = this.account.id;
          } else {
            transaction.value = uiTransaction.valueOut;
            transaction.from = this.account.id;
            transaction.to = uiTransaction.account;
          }
          this.$store.dispatch('addTransaction', transaction);
        } else {
          transaction.expense = uiTransaction.account;
          if (uiTransaction.valueIn) {
            transaction.value = uiTransaction.valueIn;
            transaction.from = 'none';
            transaction.to = this.account.id;
            this.$store.dispatch('addDualTransaction', {
              primary: transaction,
              secondary: {
                ...transaction,
                from: 'none',
                to: uiTransaction.account,
                expense: this.account.id,
                id: util.getId(),
              },
            });
          } else {
            transaction.value = uiTransaction.valueOut;
            transaction.from = this.account.id;
            transaction.to = 'none';
            this.$store.dispatch('addDualTransaction', {
              primary: transaction,
              secondary: {
                ...transaction,
                to: 'none',
                from: uiTransaction.account,
                expense: this.account.id,
                id: util.getId(),
              },
            });
          }
        }

        const event = this.isNewTransaction ? 'added' : 'updated';
        this.$emit(event, transaction);
      },
      parseDate(date) {
        return date ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
      },
      close() {
        this.$emit('close');
      },
    },
  };
</script>
