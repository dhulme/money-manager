<template>
  <div>
    <h1>Accounts</h1>
    <account-type-list account-type="asset"></account-type-list>
    <account-type-list account-type="liability"></account-type-list>
    <account-type-list account-type="budget"></account-type-list>
  </div>
</template>

<script>
  
  import SummaryAlert from '@/components/SummaryAlert';
  import AccountTypeList from '@/components/AccountTypeList';

  export default {
    components: {
      SummaryAlert,
      AccountTypeList,
    },
  };
</script>

