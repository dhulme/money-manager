<template>
  <div>
    <h1>{{ $t('headings.overview') }}</h1>
    <summary-alert></summary-alert>

    <h2>{{ $t('headings.assets') }}</h2>
    <account-list type="asset"></account-list>

    <h2>Liabilities</h2>
    <account-list type="liability"></account-list>
    
    <h2>{{ $t('headings.budgets') }}</h2>
    <account-list type="budget"></account-list>

  </div>
</template>

<script>
  import AccountList from '@/components/AccountList';
  import SummaryAlert from '@/components/SummaryAlert';

  export default {
    components: {
      SummaryAlert,
      AccountList,
    },
  };
</script>

<style>
  
</style>
