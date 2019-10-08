<template>
  <div>
    <VTextField
      v-focus
      v-model="search"
      class="mb-4"
      append-icon="search"
      label="Search"
      single-line
      hide-details
      @keyup.enter="openSearchedAccount"
    />

    <AccountList
      :search="search"
      account-category="Assets"
      account-type="asset"
      hide-on-empty
      @searched="items => searched.assets = items"
    />

    <AccountList
      :search="search"
      account-category="Liabilities"
      account-type="asset"
      hide-on-empty
      @searched="items => searched.liabilities = items"
    />

    <AccountList
      :search="search"
      account-category="Budgets"
      account-type="budget"
      hide-on-empty
      @searched="items => searched.budgets = items"
    />
  </div>
</template>

<script>
  import AccountList from '@/components/AccountList';

  export default {
    components: {
      AccountList,
    },
    data() {
      return {
        search: '',
        searched: {
          assets: null,
          liabilities: null,
          budgets: null,
        },
      };
    },
    created() {
      this.$ipc.setTitle();
    },
    methods: {
      openSearchedAccount() {
        const searchedAccounts = Object.values(this.searched).filter(_ => _.length !== 0);
        if (searchedAccounts.length === 1 && searchedAccounts[0].length === 1) {
          const account = searchedAccounts[0][0];
          this.$router.push({
            name: 'account',
            params: {
              accountId: account.id,
              accountCategory: account.category,
              accountType: account.type,
            },
          });
        }
      },
    },
  };
</script>

