<template>
  <VAppBar
    class="primary"
    dark
    app
    fixed
  >
    <ToolbarButton
      :child-route-names="['account', 'newAccount']"
      route-name="accounts"
    >Accounts</ToolbarButton>

    <ToolbarButton
      :child-route-names="['bulkTransaction', 'newBulkTransaction']"
      route-name="bulkTransactions"
    >Bulk Transactions</ToolbarButton>

    <ToolbarButton
      route-name="insights"
    >Insights</ToolbarButton>

    <VSpacer/>
    <SummaryAlert/>

  </VAppBar>
</template>

<script>
  import SummaryAlert from '@/components/SummaryAlert';
  import ToolbarButton from '@/components/ToolbarButton';

  export default {
    components: {
      SummaryAlert,
      ToolbarButton,
    },
    methods: {
    },
  };
</script>

<style lang="scss">

</style>
