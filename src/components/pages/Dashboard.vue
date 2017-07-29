<template>
  <div>
    <h1>{{ $t('headings.overview') }}</h1>
    <summary-alert></summary-alert>

    <h2>{{ $t('headings.assets') }}</h2>
    <asset-list></asset-list>

    <h2>{{ $t('headings.budgets') }}</h2>
    <budget-list></budget-list>
  </div>
</template>

<script>
  import AssetList from '@/components/AssetList';
  import BudgetList from '@/components/BudgetList';
  import SummaryAlert from '@/components/SummaryAlert';

  export default {
    components: {
      AssetList,
      SummaryAlert,
      BudgetList,
    },
  };
</script>

<style>
  
</style>
