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
        :custom-filter="customFilter"
        :footer-props="footerProps"
      >
        <template v-slot:item="props">
          <tr
            :style="{ background: props.item.highlighted ? '#E3F2FD' : 'none' }"
            @click="$emit('highlight-transaction', props.item)"
          >
            <td>{{ props.item.date | date }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.note }}</td>
            <td>{{ props.item.accountName }}</td>
            <td>{{ transactionIn(props.item) | currency }}</td>
            <td>{{ transactionOut(props.item) | currency }}</td>
            <td>{{ accountBalance(props.item) | currency }}</td>
          </tr>
        </template>
        <template v-slot:body.append>
          <tr>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td
              :class="{ 'red--text': parseFloat(account.balance) < 0 }"
              class="font-weight-medium"
            >
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
import accounting from 'accounting';

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
          value: 'value',
          align: 'left'
        },
        {
          text: this.$t('transactions.out'),
          value: 'value',
          align: 'left'
        },
        {
          text: 'Balance',
          align: 'left'
        }
      ],
      footerProps: {
        itemsPerPageOptions: [10, -1]
      }
    };
  },
  computed: {
    prettyTransactions() {
      return [...this.transactions].reverse().map(transaction => ({
        ...transaction,
        accountName: this.transactionAccountName(transaction)
      }));
    },
    searchFormatted() {
      return {
        currency: accounting.unformat(this.search),
        date: moment(this.search, this.$dateFormat).format('YYYY-MM-DD')
      };
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
    transactionAccountName(transaction) {
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
    },
    customFilter(rawValue, rawSearch) {
      if (!rawSearch) return true;
      if (!rawValue) return false;

      const value = rawValue.toString();

      // Simple search first
      if (value.toLowerCase().includes(rawSearch.toLowerCase())) return true;

      // Then do currency and date
      const { currency, date } = this.searchFormatted;
      if (currency && value.includes(currency.toString())) return true;
      if (date && value.includes(date)) return true;

      return false;
    }
  }
};
</script>
