<template>
  <div>
    <back-button name="dashboard"></back-button>
    <h1>{{ asset.name }}</h1>
    <transaction-list :transactions="transactions" editable :account="asset" account-type="asset"></transaction-list>
  </div>
</template>

<script>
  import TransactionList from '@/components/TransactionList';
  import BackButton from '@/components/BackButton';

  export default {
    components: {
      TransactionList,
      BackButton,
    },
    computed: {
      asset() {
        return this.$project.asset(this.$route.params.assetId);
      },
      transactions() {
        return this.$project.transactions({
          account: this.asset,
        });
      },
    },
  };
</script>

<style>
  
</style>
