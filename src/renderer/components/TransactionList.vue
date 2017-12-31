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
            <td class="text-xs-right">Balance</td>
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
    note: ''
  };

  export default {
    props: {
      editable: Boolean,
      account: Object,
      transactions: Array,
    },
    data() {
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
        if (transaction.expenseAccount) {
          accountId = transaction.expenseAccount;
        } else if (transaction.to === this.account.id) {
          accountId = transaction.from;
        } else {
          accountId = transaction.to;
        }
        return accountId ? this.$project.account(accountId).name : null;
      },
    },
  };
</script>