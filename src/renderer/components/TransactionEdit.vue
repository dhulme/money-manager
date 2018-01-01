<template>
  <v-card>
    <v-card-title class="headline">
      {{ isNewTransaction ? 'Add' : 'Edit' }} Transaction
    </v-card-title>
    <v-card-text>
      <v-menu
        lazy
        :close-content-on-click="false"
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
        />
        <v-date-picker v-model="newTransaction.prettyDate" no-title scrollable actions>
          <template slot-scope="{ save, cancel }">
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
              <v-btn flat color="primary" @click="save">OK</v-btn>
            </v-card-actions>
          </template>
        </v-date-picker>
      </v-menu>
      <v-text-field
        v-model="newTransaction.description"
        label="Description"
        prepend-icon="description"
      />
      <v-text-field
        v-model="newTransaction.note"
        label="Note"
        prepend-icon="note"
      />
      <v-select
        :items="accounts"
        v-model="newTransaction.account"
        label="Account"
        autocomplete
        item-text="name"
        item-value="id"
        prepend-icon="account_balance"
      />
      <v-text-field
        v-model="newTransaction.valueIn"
        label="In"
        prefix="£"
      />
      <v-text-field
        v-model="newTransaction.valueOut"
        label="Out"
        prefix="£"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn flat @click="$emit('close') ">Close</v-btn>
      <v-btn color="primary" flat @click="addTransaction">{{ isNewTransaction ? 'Add' : 'Update' }}</v-btn>
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
      };
    },
    computed: {
      isNewTransaction() {
        return !this.transaction.account;
      },
      accounts() {
        return this.$project.sortAccounts(this.$project.accounts().filter(account => account.id !== this.account.id));
      },
    },
    watch: {
      transaction(transaction) {
        console.log(transaction);
        this.newTransaction = {
          ...transaction,
          prettyDate: this.$options.filters.date(transaction.date)
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
        const uiTransaction = this.newTransaction;
        const transactionAccount = this.$project.account(uiTransaction.account);
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
          this.$project.addTransaction(transaction);
        } else {
          transaction.expenseAccount = uiTransaction.account;
          if (uiTransaction.valueIn) {
            transaction.value = uiTransaction.valueIn;
            transaction.from = 'none';
            transaction.to = this.account.id;
            this.$project.addTransaction({
              ...transaction,
              from: 'none',
              to: uiTransaction.account,
              expenseAccount: this.account.id
            });
          } else {
            transaction.value = uiTransaction.valueOut;
            transaction.from = this.account.id;
            transaction.to = 'none';
            this.$project.addTransaction({
              ...transaction,
              to: 'none',
              from: uiTransaction.account,
              expenseAccount: this.account.id
            });
          }
          this.$project.addTransaction(transaction);
        }

        this.$store.commit('setSummaryBalance', this.$project.summaryBalance());
        this.$emit('added', transaction);
      }
    }
  };
</script>
