<template>
  <v-card>
    <v-card-title>Account value over time</v-card-title>
    <account-value-over-time 
      :account="account" 
      :height="200" />
  </v-card>
</template>

<script>
import AccountValueOverTime from '../charts/AccountValueOverTime.vue';

export default {
  components: {
    AccountValueOverTime
  },
  computed: {
    account() {
      return this.$store.getters['project/account']('food');
    }
  }
};
</script>
