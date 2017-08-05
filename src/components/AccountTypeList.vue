<template>
  <div>
    <h2>{{ $t(`headings.${accountType}`) }}</h2>
    <new-account-button :account-type="accountType" class="new-account"></new-account-button>
    <account-list :account-type="accountType"></account-list>
  </div>
</template>

<script>
  import AccountList from '@/components/AccountList';
  import NewAccountButton from '@/components/NewAccountButton';

  export default {
    props: ['accountType'],
    components: {
      AccountList,
      NewAccountButton,
    },
  };
</script>

<style lang="scss" scoped>
  .new-account {
    margin: 5px 0;
  }
</style>
