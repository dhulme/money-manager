<template>
  <v-toolbar
    class="primary"
    dark
    app
    fixed
  >
    <toolbar-button
      :child-route-names="['account', 'newAccount']"
      route-name="accounts"
    >Accounts</toolbar-button>

    <toolbar-button
      :child-route-names="['bulkTransaction', 'newBulkTransaction']"
      route-name="bulkTransactions"
    >Bulk Transactions</toolbar-button>

    <v-spacer/>
    <summary-alert/>

  </v-toolbar>
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
