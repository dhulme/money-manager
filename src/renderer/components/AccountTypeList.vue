<template>
  <div class="account-type-list">
    <h4>{{ $t(`headings.${accountType}`) }}</h4>
    <account-list :account-type="accountType" :search="search"></account-list>
  </div>
</template>

<script>
  import AccountList from '@/components/AccountList';

  export default {
    props: {
      accountType: String,
      search: String,
    },
    components: {
      AccountList,
    },
  };
</script>

<style lang="scss" scoped>
  .new-account {
    margin: 5px 0;
  }

  .account-type-list {
    margin-bottom: 20px;
  }
</style>
