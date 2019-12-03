<template>
  <VAppBar class="primary" dark app fixed>
    <ToolbarButton
      :child-route-names="[
        'account',
        'newAccount',
        'editAccount',
        'newAccountCategory'
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

    <VSpacer />
    <TheAlerts />
  </VAppBar>
</template>

<script>
import TheAlerts from '@/components/TheAlerts';
import ToolbarButton from '@/components/ToolbarButton';

export default {
  components: {
    TheAlerts,
    ToolbarButton
  }
};
</script>
