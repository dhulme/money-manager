<template>
  <div>
    <VCard class="mb-4">
      <VCardTitle class="headline pb-0">Insights</VCardTitle>
      <VCardText>
        <AccountSelect v-model="accountId" />
      </VCardText>
    </VCard>
    
    <VCard>
      <VCardTitle>Account value over time</VCardTitle>
      <AccountValueOverTime 
        :account="account" 
        :height="200" />
    </VCard>
  </div>
</template>

<script>
import AccountValueOverTime from '../charts/AccountValueOverTime.vue';
import AccountSelect from '../AccountSelect.vue';

export default {
  components: {
    AccountValueOverTime,
    AccountSelect
  },
  data() {
    return {
      accountId: null
    }
  },
  computed: {
    account() {
      return this.$store.getters['project/account'](this.accountId);
    }
  }
};
</script>
