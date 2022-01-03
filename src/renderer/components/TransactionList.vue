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
        <VBtn text @click="toggleFilters" class="toggle-filters">{{
          showFilters ? 'Clear' : 'Filter'
        }}</VBtn>
        <template v-if="showFilters">
          <DateRange @dateRange="dateRange = $event" slim />
          <VSelect
            v-model="direction"
            :items="['Both', 'In', 'Out']"
            label="In/Out"
            single-line
            hide-details
            class="input"
          />
        </template>
        <VSpacer />
        <VTextField
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
          autofocus
          class="input"
        />
      </VCardTitle>
      <VDataTable
        :headers="headers"
        :items="filteredTransactions"
        :search="search"
        :custom-filter="customFilter"
        :footer-props="footerProps"
        :page.sync="page"
      >
        <template v-slot:item="props">
          <tr
            :style="{ background: props.item.highlighted ? '#E3F2FD' : 'none' }"
            @click="$emit('edit-transaction', props.item)"
          >
            <td>{{ props.item.date | date }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.note }}</td>
            <td>{{ props.item.accountName }}</td>
            <td>{{ transactionIn(props.item) | currency }}</td>
            <td>{{ transactionOut(props.item) | currency }}</td>
            <td v-if="!hasFilter">
              {{ accountBalance(props.item) | currency }}
            </td>
            <td v-else />
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
              :class="{
                'red--text': !hasFilter && parseFloat(account.balance) < 0,
              }"
              class="balance"
            >
              {{
                hasFilter
                  ? filteredTransactionsTotal
                  : account.balance | currency
              }}
            </td>
          </tr>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>

<script>
import moment from 'moment';
import { isAfter, isBefore, parseISO, isSameDay } from 'date-fns';
import Big from 'big.js';
import DateRange from './DateRange.vue';

const defaultTransaction = {
  date: moment(),
  description: '',
  valueIn: '',
  valueOut: '',
  account: 'none',
  note: '',
};

export default {
  components: {
    DateRange,
  },
  props: {
    account: {
      type: Object,
      default: () => ({}),
    },
    transactions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      transaction: {
        ...defaultTransaction,
      },
      search: '',
      footerProps: {
        itemsPerPageOptions: [10, -1],
      },
      page: 1,
      dateRange: [],
      direction: '',
      showFilters: false,
    };
  },
  computed: {
    headers() {
      return [
        {
          text: 'Date',
          value: 'date',
          align: 'left',
        },
        {
          text: 'Description',
          value: 'description',
          align: 'left',
        },
        {
          text: 'Note',
          value: 'note',
          align: 'left',
        },
        {
          text: 'Account',
          value: 'accountName',
          align: 'left',
        },
        {
          text: 'In',
          value: 'value',
          align: 'left',
        },
        {
          text: 'Out',
          value: 'value',
          align: 'left',
        },
        {
          text: this.hasFilter ? 'Total' : 'Balance',
          align: 'left',
        },
      ];
    },
    hasFilter() {
      return this.dateRange.length || this.direction;
    },
    filteredTransactions() {
      return this.transactions
        .filter((transaction) => {
          const date = parseISO(transaction.date);
          if (this.dateRange.length === 1) {
            if (!isSameDay(date, this.dateRange[0])) return false;
          }
          if (this.dateRange.length === 2) {
            if (
              isBefore(date, this.dateRange[0]) ||
              isAfter(date, this.dateRange[1])
            )
              return false;
          }
          if (this.direction && this.direction !== 'Both') {
            if (this.direction === 'In' && !this.transactionIn(transaction))
              return false;
            if (this.direction === 'Out' && !this.transactionOut(transaction))
              return false;
          }
          return true;
        })
        .reverse()
        .map((transaction) => ({
          ...transaction,
          accountName: this.transactionAccountName(transaction),
        }));
    },
    filteredTransactionsTotal() {
      return this.filteredTransactions.reduce((sum, transaction) => {
        return transaction.to === this.account.id
          ? sum.plus(transaction.value)
          : sum.minus(transaction.value);
      }, new Big(0));
    },
  },
  watch: {
    search() {
      this.page = 1;
    },
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
      const date = moment(this.search, this.$dateFormat).format('YYYY-MM-DD');
      if (date && value.includes(date)) return true;

      return false;
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;

      if (!this.showFilters) {
        this.direction = '';
        this.dateRange = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.balance {
  font-size: 0.875rem;
  height: 48px;
  padding: 0 1rem;
  font-weight: 500;
}
.input {
  padding-top: 0;
  margin-top: 0;
}
.toggle-filters {
  margin-right: 0.5rem;
}
</style>
