<template>
  <div>
    <h2>Accounts</h2>
    <account-type-list account-type="asset"></account-type-list>
    <account-type-list account-type="liability"></account-type-list>
    <account-type-list account-type="budget"></account-type-list>
  </div>
</template>

<script>
  import AccountTypeList from '@/components/AccountTypeList';

  export default {
    components: {
      AccountTypeList,
    },
  };
</script>

