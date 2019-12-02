<template>
  <div>
    <VAutocomplete v-model="accountId" :items="accounts" label="Account" />
    <!-- <VCard class="mb-4">
			<VCardTitle>Account category value over time ({{ account.category }})</VCardTitle>
			<AccountCategoryValueOverTime 
				:category="account.category"
				:height="200" />
		</VCard> -->
    <VCard>
      <VCardTitle>Account value over time</VCardTitle>
      <AccountValueOverTime :account="account" :height="120" />
    </VCard>
    <VRow>
      <VCol md="6">
        <VCard>
          <VCardTitle>Monthly spending over time</VCardTitle>
          <AccountSpendingOverTime :account="account" :height="200" />
        </VCard>
      </VCol>
      <VCol md="6">
        <VCard>
          <VCardTitle>Spending last month</VCardTitle>
          <SpendingPerMonth :date="monthDate" :height="200" />
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script>
import moment from 'moment';

import AccountValueOverTime from '../charts/AccountValueOverTime.vue';
// import AccountCategoryValueOverTime from '../charts/AccountCategoryValueOverTime.vue';
import AccountSpendingOverTime from '../charts/AccountSpendingOverTime.vue';
import SpendingPerMonth from '../charts/SpendingPerMonth.vue';

export default {
  components: {
    AccountValueOverTime,
    AccountSpendingOverTime,
    SpendingPerMonth
  },
  data() {
    return {
      accountId: null
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
    }
  }
};
</script>
