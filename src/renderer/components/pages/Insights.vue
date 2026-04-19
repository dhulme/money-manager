<template>
  <div>
    <v-autocomplete
      v-model="accountId"
      :items="accounts"
      label="Account"
      auto-select-first
    />
    <DateRange @dateRange="dateRange = $event" type="month" />

    <v-card v-if="!accountId">
      <v-card-title>Spending for {{ formattedMonth }}</v-card-title>
      <v-card-text
        ><SpendingPerMonth :date="monthDate" :height="140"
      /></v-card-text>
    </v-card>
    <template v-else>
      <v-card class="mb-3">
        <v-card-title>Account spending over time</v-card-title>
        <v-card-text
          ><AccountSpendingOverTime
            :account="account"
            :date-range="dateRange"
            :height="140"
        /></v-card-text>
      </v-card>
      <v-card>
        <v-card-title>Account value over time</v-card-title>
        <v-card-text
          ><AccountValueOverTime
            :account="account"
            :date-range="dateRange"
            :height="120"
        /></v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script>
import AccountValueOverTime from '../charts/AccountValueOverTime.vue';
import AccountSpendingOverTime from '../charts/AccountSpendingOverTime.vue';
import SpendingPerMonth from '../charts/SpendingPerMonth.vue';
import DateRange from '../DateRange.vue';
import { subMonths, format } from 'date-fns';
import { useProjectStore } from '@/store';

export default {
  setup() {
    return { projectStore: useProjectStore() };
  },
  components: {
    AccountValueOverTime,
    AccountSpendingOverTime,
    SpendingPerMonth,
    DateRange,
  },
  data() {
    return {
      accountId: this.$route.params.accountId || null,
      dateRange: [],
    };
  },
  computed: {
    account() {
      return this.projectStore.getAccount(this.accountId);
    },
    accounts() {
      return [
        {
          title: 'All',
          value: null,
        },
        ...this.projectStore.accountItems,
      ];
    },
    monthDate() {
      return this.dateRange[0] || subMonths(new Date(), 1);
    },
    formattedMonth() {
      return format(this.monthDate, 'MMMM yyyy');
    },
  },
};
</script>
