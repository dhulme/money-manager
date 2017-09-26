<template>
  <div>
    <back-button name="dashboard"></back-button>
    <v-btn class="btn btn-danger" @click="deleteAccount">Delete account</v-btn>
    <h1>{{ account.name }}</h1>
    <transaction-list editable :account="account" ></transaction-list>
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
      account() {
        return this.$project.account(this.$route.params.accountId);
      },
    },
    methods: {
      deleteAccount() {
        this.$project.deleteAccount(this.$route.params.accountId);
        this.$router.push({
          name: 'dashboard',
        });
      },
    },
  };
</script>

<style>
  
</style>
