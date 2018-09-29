<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="headline pb-0">Insights</v-card-title>
      <v-card-text>
        <account-select v-model="accountId" />
      </v-card-text>
    </v-card>
    
    <v-card>
      <v-card-title>Account value over time</v-card-title>
      <account-value-over-time 
        :account="account" 
        :height="200" />
    </v-card>
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
