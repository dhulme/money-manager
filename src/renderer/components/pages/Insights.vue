<template>
  <div>
    <VAutocomplete
      v-model="accountId"
      :items="accounts"
      label="Account"
      auto-select-first
    />
    <DateRange @dateRange="dateRange = $event" type="month" />

    <VCard v-if="!accountId">
      <VCardTitle>Spending for {{ formattedMonth }}</VCardTitle>
      <VCardText
        ><SpendingPerMonth :date="monthDate" :height="140"
      /></VCardText>
    </VCard>
    <template v-else>
      <VCard class="mb-3">
        <VCardTitle>Account spending over time</VCardTitle>
        <VCardText
          ><AccountSpendingOverTime
            :account="account"
            :date-range="dateRange"
            :height="140"
        /></VCardText>
      </VCard>
      <VCard>
        <VCardTitle>Account value over time</VCardTitle>
        <VCardText
          ><AccountValueOverTime
            :account="account"
            :date-range="dateRange"
            :height="120"
        /></VCardText>
      </VCard>
    </template>
  </div>
</template>

<script>
import AccountValueOverTime from '../charts/AccountValueOverTime.vue';
import AccountSpendingOverTime from '../charts/AccountSpendingOverTime.vue';
import SpendingPerMonth from '../charts/SpendingPerMonth.vue';
import DateRange from '../DateRange.vue';
import { subMonths, format } from 'date-fns';

export default {
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
      return this.$store.getters['project/account'](this.accountId);
    },
    accounts() {
      return [
        {
          text: 'All',
          value: null,
        },
        ...this.$store.getters['project/accountItems'],
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
