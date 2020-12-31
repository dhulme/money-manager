<template>
  <div>
    <VAutocomplete v-model="accountId" :items="accounts" label="Account" />
    <VRow class="mb-2">
      <VCol md="6">
        <VCard>
          <VCardTitle>Account spending over time</VCardTitle>
          <VCardText
            ><AccountSpendingOverTime :account="account" :height="140"
          /></VCardText>
        </VCard>
      </VCol>
      <VCol md="6">
        <VCard>
          <VCardTitle>Total spending last month</VCardTitle>
          <VCardText
            ><SpendingPerMonth :date="monthDate" :height="140"
          /></VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VCard>
      <VCardTitle>Account value over time</VCardTitle>
      <VCardText
        ><AccountValueOverTime :account="account" :height="120"
      /></VCardText>
    </VCard>
  </div>
</template>

<script>
import moment from 'moment';

import AccountValueOverTime from '../charts/AccountValueOverTime.vue';
import AccountSpendingOverTime from '../charts/AccountSpendingOverTime.vue';
import SpendingPerMonth from '../charts/SpendingPerMonth.vue';

export default {
  components: {
    AccountValueOverTime,
    AccountSpendingOverTime,
    SpendingPerMonth,
  },
  data() {
    return {
      accountId: null,
    };
  },
  created() {
    this.accountId = this.accounts[0].value;
  },
  computed: {
    account() {
      return this.$store.getters['project/account'](this.accountId);
    },
    accounts() {
      return this.$store.getters['project/accountItems'];
    },
    monthDate() {
      return moment().subtract(1, 'months');
    },
  },
};
</script>
