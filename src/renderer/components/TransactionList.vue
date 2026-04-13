<template>
  <div>
    <v-card>
      <v-card-title>
        <v-row class="align-center ma-0">
          <span class="text-h6">Transactions</span>
          <v-btn
            v-hotkey.add="addTransaction"
            variant="text"
            color="primary"
            @click="addTransaction"
            >Add</v-btn
          >
          <v-btn variant="text" @click="toggleFilters" class="toggle-filters">{{
            showFilters ? 'Clear' : 'Filter'
          }}</v-btn>
          <template v-if="showFilters">
            <DateRange @dateRange="dateRange = $event" slim />
            <v-select
              v-model="direction"
              :items="['Both', 'In', 'Out']"
              label="In/Out"
              single-line
              hide-details
              class="input"
            />
          </template>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            autofocus
            class="input"
          />
        </v-row>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredTransactions"
        :search="search"
        :custom-filter="customFilter"
        :items-per-page-options="[10, -1]"
        v-model:page="page"
      >
        <template v-slot:item="{ item }">
          <tr
            :style="{ background: item.highlighted ? '#E3F2FD' : 'none' }"
            @click="$emit('edit-transaction', item)"
          >
            <td>{{ $date(item.date) }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.note }}</td>
            <td>{{ item.accountName }}</td>
            <td>{{ $currency(transactionIn(item)) }}</td>
            <td>{{ $currency(transactionOut(item)) }}</td>
            <td v-if="!hasFilter">
              {{ $currency(accountBalance(item)) }}
            </td>
            <td v-else />
          </tr>
        </template>
        <template v-slot:tfoot>
          <tfoot>
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td
                :class="{
                  'text-red': !hasFilter && parseFloat(account.balance) < 0,
                }"
                class="balance"
              >
                {{
                  hasFilter
                    ? $currency(filteredTransactionsTotal)
                    : $currency(account.balance)
                }}
              </td>
            </tr>
          </tfoot>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { isAfter, isBefore, parseISO, isSameDay, parse } from 'date-fns';
import Big from 'big.js';
import DateRange from './DateRange.vue';

const defaultTransaction = {
  date: new Date(),
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
      page: 1,
      dateRange: [],
      direction: '',
      showFilters: false,
    };
  },
  computed: {
    headers() {
      return [
        { title: 'Date', key: 'date', align: 'start' },
        { title: 'Description', key: 'description', align: 'start' },
        { title: 'Note', key: 'note', align: 'start' },
        { title: 'Account', key: 'accountName', align: 'start' },
        { title: 'In', key: 'value', align: 'start' },
        { title: 'Out', key: 'value', align: 'start' },
        { title: this.hasFilter ? 'Total' : 'Balance', align: 'start' },
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

      if (value.toLowerCase().includes(rawSearch.toLowerCase())) return true;

      try {
        const date = parse(this.search, this.$dateFormat, new Date());
        if (date && !isNaN(date)) {
          const isoDate = date.toISOString().substring(0, 10);
          if (value.includes(isoDate)) return true;
        }
      } catch (e) {
        // ignore parse errors
      }

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
  font-weight: 600;
}
.input {
  padding-top: 0;
  margin-top: 0;
}
.toggle-filters {
  margin-right: 0.5rem;
}
</style>
