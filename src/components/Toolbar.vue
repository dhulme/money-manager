<template>
  <v-toolbar dark class="primary" app fixed>
    <toolbar-button route-name="accounts" :child-route-names="['account']">Accounts</toolbar-button>
    <toolbar-button route-name="bulkTransactions" :child-route-names="['bulkTransaction']">Bulk Transactions</toolbar-button>
    <v-spacer></v-spacer>
    <summary-alert></summary-alert>
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
