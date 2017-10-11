<template>
  <div>
    <h4>{{ $t(`headings.${accountType}`) }}</h4>
    <account-list :account-type="accountType"></account-list>
  </div>
</template>

<script>
  import AccountList from '@/components/AccountList';

  export default {
    props: ['accountType'],
    components: {
      AccountList,
    },
  };
</script>

<style lang="scss" scoped>
  .new-account {
    margin: 5px 0;
  }
</style>
