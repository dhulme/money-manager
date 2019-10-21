<template>
  <div>
    <VCard>
      <VCardTitle>
        <span class="headline">Transactions</span>
        <VBtn
          v-hotkey.add="addTransaction"
          text
          color="primary"
          @click="addTransaction"
          >Add</VBtn
        >
        <VSpacer />
        <VTextField
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        />
      </VCardTitle>
      <VDataTable
        :headers="headers"
        :items="prettyTransactions"
        :search="search"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        must-sort
      >
        <template slot-scope="props" slot="item">
          <tr
            :style="{ background: props.item.highlighted ? '#E3F2FD' : 'none' }"
            @click="$emit('highlight-transaction', props.item)"
          >
            <td>{{ props.item.prettyDate }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.note }}</td>
            <td>{{ props.item.accountName }}</td>
            <td>{{ props.item.in }}</td>
            <td>{{ props.item.out }}</td>
            <td>{{ props.item.balance }}</td>
          </tr>
        </template>
        <template slot="footer">
          <tr>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td :class="{ 'red--text': parseFloat(account.balance) < 0 }">
              {{ account.balance | currency }}
            </td>
          </tr>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>

<script>
import moment from 'moment';
import Vue from 'vue';

const defaultTransaction = {
  date: moment(),
  description: '',
  valueIn: '',
  valueOut: '',
  account: 'none',
  note: ''
};

export default {
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    transactions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const rowsPerPage = 10;
    return {
      transaction: {
        ...defaultTransaction
      },
      search: '',
      headers: [
        {
          text: this.$t('transactions.date'),
          value: 'date',
          align: 'left'
        },
        {
          text: this.$t('transactions.description'),
          value: 'description',
          align: 'left'
        },
        {
          text: this.$t('transactions.note'),
          value: 'note',
          align: 'left'
        },
        {
          text: 'Account',
          value: 'accountName',
          align: 'left'
        },
        {
          text: this.$t('transactions.in'),
          value: 'in',
          align: 'left'
        },
        {
          text: this.$t('transactions.out'),
          value: 'out',
          align: 'left'
        },
        {
          text: 'Balance',
          value: 'balance',
          align: 'left'
        }
      ],
      rowsPerPageItems: [
        rowsPerPage,
        {
          text: 'All',
          value: -1
        }
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
        rowsPerPage
      }
    };
  },
  computed: {
    prettyTransactions() {
      const dateFilter = Vue.filter('date');
      const currencyFilter = Vue.filter('currency');
      return this.transactions.map(transaction => ({
        ...transaction,
        accountName: this.transactionAccount(transaction),
        prettyDate: dateFilter(transaction.date),
        in: currencyFilter(this.transactionIn(transaction)),
        out: currencyFilter(this.transactionOut(transaction)),
        balance: currencyFilter(this.accountBalance(transaction))
      }));
    }
  },
  methods: {
    resetForm() {
      this.transaction = {
        ...defaultTransaction
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
      if (transaction.expense) {
        accountId = transaction.expense;
      } else if (transaction.to === this.account.id) {
        accountId = transaction.from;
      } else {
        accountId = transaction.to;
      }
      return accountId
        ? this.$store.getters['project/account'](accountId).name
        : null;
    },
    addTransaction() {
      this.$emit('add-transaction');
    },
    accountBalance(transaction) {
      return this.$store.getters['project/accountBalance'](
        this.account,
        transaction.id
      );
    }
  }
};
</script>
