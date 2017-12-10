<template>
  <v-card class="mb-4">
    <v-card-title>
      <span class="headline">{{ $t(`headings.${accountType}`) }}</span>
      <v-spacer />
      <v-btn flat @click="newAccount">New Account</v-btn>
    </v-card-title>
    <account-list :account-type="accountType" :search="search"></account-list>
  </v-card>
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
    methods: {
      newAccount() {
        this.$router.push({
          name: 'newAccount',
          params: {
            accountId: 'new',
            accountType: this.accountType,
          },
        });
      }
    }
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
