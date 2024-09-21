<template>
  <VAppBar class="primary" dark app fixed>
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

    <VSpacer />
    <TheAlerts />
  </VAppBar>
</template>

<script>
import TheAlerts from './TheAlerts.vue';
import ToolbarButton from './ToolbarButton.vue';

export default {
  components: {
    TheAlerts,
    ToolbarButton,
  },
};
</script>
