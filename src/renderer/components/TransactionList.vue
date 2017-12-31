<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="headline">
          Transactions
        </span>
        <v-btn flat color="primary" @click="$emit('add-transaction')">Add</v-btn>
        <v-spacer />
        <v-text-field
          append-icon="search"
          label="Search"
          single-line
          hide-details
          v-model="search"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="transactions"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <tr @click="$emit('transaction-click', props.item)">
            <td>{{ props.item.date | date }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.note }}</td>
            <td>{{ $t(`transactionTypes.${props.item.type}`) }}
            <td>{{ transactionAccount(props.item) }}</td>
            <td>{{ transactionIn(props.item) | currency }}</td>
            <td>{{ transactionOut(props.item) | currency }}</td>
          </tr>
        </template>
        <template slot="footer">
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="balance">Balance</td>
            <td :class="{ 'red--text': parseFloat(account.balance) < 0 }">
              {{ account.balance | currency }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import moment from 'moment';

  import util from '@/util';

  const dateFormat = 'DD/MM/YYYY';
  const defaultTransaction = {
    date: moment().format(dateFormat),
    description: '',
    valueIn: '',
    valueOut: '',
    account: 'none',
    note: '',
    type: 'transfer',
  };

  export default {
    data() {
      const transactions = this.$project.transactions(this.account);
      const rowsPerPage = 10;
      return {
        transaction: {
          ...defaultTransaction,
        },
        search: '',
        headers: [{
          text: this.$t('transactions.date'),
          value: 'date',
          align: 'left',
        }, {
          text: this.$t('transactions.description'),
          value: 'description',
          align: 'left',
        }, {
          text: this.$t('transactions.note'),
          value: 'note',
          align: 'left',
        }, {
          text: 'Type',
          value: 'type',
          align: 'left',
        }, {
          text: 'Account',
          value: 'account',
          align: 'left',
        }, {
          text: this.$t('transactions.in'),
          value: 'value',
          align: 'left',
        }, {
          text: this.$t('transactions.out'),
          value: 'value',
          align: 'left',
        }],
        transactions,
        rowsPerPageItems: [rowsPerPage, {
          text: 'All',
          value: -1,
        }],
        pagination: {
          sortBy: 'date',
          descending: true,
          rowsPerPage,
        },
      };
    },
    props: {
      editable: Boolean,
      account: Object,
    },
    methods: {
      resetForm() {
        this.transaction = {
          ...defaultTransaction,
        };
      },
      transactionIn(transaction) {
        if (transaction.to === this.account.id) {
          return transaction.value;
        }
        return null;
      },
      transactionOut(transaction) {
        if (transaction.from === this.account.id) {
          return transaction.value;
        }
        return null;
      },
      transactionAccount(transaction) {
        let accountId;
        if (transaction.type === 'expense') {
          accountId = transaction.expenseAccount;
        } else if (transaction.to === this.account.id) {
          accountId = transaction.from;
        } else {
          accountId = transaction.to;
        }
        return accountId ? this.$project.account(accountId).name : null;
      },
      addTransaction() {
        const transaction = {
          description: this.transaction.description,
          note: this.transaction.note,
          type: this.transaction.type,
          date: moment(this.transaction.date, dateFormat),
        };

        if (parseFloat(this.transaction.valueIn) < 0 || parseFloat(this.transaction.valueOut) < 0) {
          throw new Error(this.$store.commit('setError', 'You cannot enter negative numbers'));
        }
        if (this.transaction.valueIn && this.transaction.valueOut) {
          throw new Error(this.$store.commit('setError', 'A transaction cannot be both in and out'));
        }
        if (!this.transaction.valueIn && !this.transaction.valueOut) {
          throw new Error(this.$store.commit('setError', 'A transaction must have a value'));
        }

        if (this.transaction.valueIn) {
          transaction.value = this.transaction.valueIn;
          transaction.to = this.account.id;
          transaction.from = this.transaction.account;
        } else if (this.transaction.valueOut) {
          transaction.value = this.transaction.valueOut;
          transaction.to = this.transaction.account;
          transaction.from = this.account.id;
        }

        this.$project.addTransaction(transaction);
        this.transactions.push(transaction);

        this.$store.commit('setSummaryBalance', this.$project.summaryBalance());

        this.resetForm();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .balance {
    text-align: right;
  }

  .new-row /deep/ input {
    width: 100%;
  }
</style>
