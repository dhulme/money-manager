<template>
  <VCard v-if="reportId === 'giftAid'">
    <VCardTitle>Gift Aid</VCardTitle>
    <VCardText>
      <VSelect :items="years" label="Tax Year" v-model="dateRange" />

      <VDataTable :headers="headers" :items="transactions">
        <template v-slot:item="props">
          <tr>
            <td>{{ props.item.date | date }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.value | currency }}</td>
          </tr>
        </template>
        <template v-slot:body.append>
          <tr>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td />
            <td class="font-weight-bold">Total</td>
            <td class="font-weight-bold">{{ total | currency }}</td>
          </tr>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>
</template>

<script>
import Big from 'big.js';
import { addYears, set, format, parseISO } from 'date-fns';
const dateFormat = 'do MMMM yyyy';
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
          text: `${format(startDate, dateFormat)} - ${format(
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
      const transactions = this.accounts
        .flatMap((account) => account.transactionIds)
        .map((transactionId) => getTransaction(transactionId))
        .filter((transaction) => {
          const date = parseISO(transaction.date);
          return (
            this.dateRange &&
            date >= this.dateRange[0] &&
            date <= this.dateRange[1] &&
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
          text: 'Amount',
          value: 'value',
          align: 'left',
        },
      ];
    },
  },
};
</script>
