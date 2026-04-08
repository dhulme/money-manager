<template>
  <v-app-bar color="primary">
    <ToolbarButton
      :child-route-names="[
        'account',
        'newAccount',
        'editAccount',
        'newAccountCategory',
      ]"
      route-name="accounts"
      >Accounts</ToolbarButton
    >

    <ToolbarButton
      :child-route-names="['bulkTransaction', 'newBulkTransaction']"
      route-name="bulkTransactions"
      >Bulk Transactions</ToolbarButton
    >

    <ToolbarButton route-name="insights">Insights</ToolbarButton>

    <ToolbarButton route-name="reports" :child-route-names="['report']"
      >Reports</ToolbarButton
    >

    <v-spacer />
    <TheAlerts />
  </v-app-bar>
</template>

<script>
import TheAlerts from '@/components/TheAlerts.vue';
import ToolbarButton from '@/components/ToolbarButton.vue';

export default {
  components: {
    TheAlerts,
    ToolbarButton,
  },
};
</script>
