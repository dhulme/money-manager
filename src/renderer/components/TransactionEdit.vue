<template>
  <v-card>
    <v-card-title class="headline">
      {{ isNewTransaction ? 'Add' : 'Edit' }} Transaction
    </v-card-title>
    <v-card-text>
      <v-form
        v-model="valid"
        ref="form"
        lazy-validation
      >
        <v-menu
          lazy
          ref="dateMenu"
          :close-on-content-click="false"
          v-model="dateMenu"
          transition="scale-transition"
          offset-y
          full-width
          :nudge-right="40"
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            label="Date"
            v-model="newTransaction.prettyDate"
            prepend-icon="event"
            readonly
            required
            :rules="dateValidationRules"
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
          v-model="newTransaction.description"
          label="Description"
          prepend-icon="description"
          required
          :rules="descriptionValidationRules"
          ref="description"
          @keyup.enter="addTransaction"
        />
        <v-text-field
          v-model="newTransaction.note"
          label="Note"
          prepend-icon="note"
          @keyup.enter="addTransaction"
        />
        <v-select
          :items="accounts"
          v-model="newTransaction.account"
          label="Account"
          autocomplete
          prepend-icon="account_balance"
          required
          :rules="accountValidationRules"
          @keyup.enter="addTransaction"
        />
        <v-text-field
          v-model="newTransaction.valueIn"
          label="In"
          prefix="£"
          :rules="valueValidationRules"
          @keyup.enter="addTransaction"
        />
        <v-text-field
          v-model="newTransaction.valueOut"
          label="Out"
          prefix="£"
          :rules="valueValidationRules"
          @keyup.enter="addTransaction"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn
        flat
        @click="$emit('close')"
      >Close</v-btn>
      <v-btn
        color="primary"
        flat
        @click="addTransaction"
      >OK</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import moment from 'moment';

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
            if (this.newTransaction.valueOut || this.newTransaction.valueIn) {
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
      addTransaction() {
        if (!this.$refs.form.validate()) {
          return;
        }

        const uiTransaction = this.newTransaction;
        const transactionAccount = this.$store.getters.account(uiTransaction.account);
        const transaction = {
          description: uiTransaction.description,
          note: uiTransaction.note,
          date: moment(uiTransaction.date),
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
              },
            });
          }
        }

        this.$emit('added', transaction);
      },
      parseDate(date) {
        return date ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
      },
    },
  };
</script>
