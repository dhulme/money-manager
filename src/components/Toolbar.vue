<template>
  <v-toolbar dark class="primary" app fixed>
    <v-toolbar-title class="white--text">Money Manager</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn flat @click="route('dashboard')">Dashboard</v-btn>
    <v-btn flat @click="route('bulkTransactions')">Bulk Transactions</v-btn>
    <summary-alert></summary-alert>
  </v-toolbar>
</template>

<script>
  import SummaryAlert from '@/components/SummaryAlert';

  export default {
    components: {
      SummaryAlert,
    },
    methods: {
      route(name) {
        this.$router.push({
          name,
        });
      },
    },
  };
</script>

<style lang="scss">

</style>
