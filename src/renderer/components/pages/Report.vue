<template>
  <v-card v-if="reportId === 'giftAid'">
    <v-card-title>
      Gift Aid
      <v-spacer />
      <v-btn variant="text" @click="exportCsv">Export as CSV</v-btn>
    </v-card-title>
    <v-card-text>
      <v-select :items="years" label="Tax Year" v-model="dateRange" return-object />

      <v-data-table :headers="headers" :items="transactions">
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ $date(item.date) }}</td>
            <td>{{ item.description }}</td>
            <td>{{ $currency(item.value) }}</td>
          </tr>
        </template>
        <template v-slot:bottom>
          <tr>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td />
            <td class="font-weight-bold">Total</td>
            <td class="font-weight-bold">{{ $currency(total) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import Big from 'big.js';
import { addYears, set, format, parseISO } from 'date-fns';
import ipc from '@/ipc';
import { unparse } from 'papaparse';

const dateFormat = 'd MMMM yyyy';
const today = new Date();

export default {
  data() {
    return {
      dateRange: null,
      years: [0, -1, -2, -3].map((yearAdjust) => {
        const startDate = addYears(
          set(today, {
            month: 3,
            date: 6,
          }),
          yearAdjust
        );
        const endDate = addYears(
          set(today, {
            month: 3,
            date: 5,
          }),
          yearAdjust + 1
        );
        return {
          title: `${format(startDate, dateFormat)} - ${format(
            endDate,
            dateFormat
          )}`,
          value: [startDate, endDate],
        };
      }),
    };
  },
  computed: {
    reportId() {
      return this.$route.params.reportId;
    },
    accounts() {
      return this.$store.getters['project/accountsByType']('asset');
    },
    transactions() {
      const getTransaction = this.$store.getters['project/transaction'];
      const transactions = [...new Set(
        this.accounts.flatMap((account) => account.transactionIds)
      )]
        .map((transactionId) => getTransaction(transactionId))
        .filter((transaction) => {
          const date = parseISO(transaction.date);
          return (
            this.dateRange &&
            date >= this.dateRange.value[0] &&
            date <= this.dateRange.value[1] &&
            transaction.giftAided
          );
        });
      return transactions;
    },
    total() {
      return this.transactions.reduce((total, transaction) => {
        return total.plus(transaction.value);
      }, new Big(0));
    },
    headers() {
      return [
        {
          title: 'Date',
          key: 'date',
          align: 'start',
        },
        {
          title: 'Description',
          key: 'description',
          align: 'start',
        },
        {
          title: 'Amount',
          key: 'value',
          align: 'start',
        },
      ];
    },
  },
  methods: {
    exportCsv() {
      ipc.exportCsv(
        'transactions',
        unparse(
          this.transactions.map((transaction) => ({
            Date: format(parseISO(transaction.date), this.$dateFormat),
            Description: transaction.description,
            Amount: transaction.value,
          }))
        )
      );
    },
  },
};
</script>
