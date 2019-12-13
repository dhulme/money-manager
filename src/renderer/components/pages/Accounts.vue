<template>
  <div>
    <VTextField
      autofocus
      v-model="search"
      class="mb-4"
      append-icon="search"
      label="Search"
      single-line
      hide-details
      @keyup.enter="openSearchedAccount"
    />

    <AccountList
      v-for="category in $store.getters['project/accountCategories']"
      :search="search"
      :account-category="category.name"
      :account-type="category.type"
      :hide-on-empty="!!search"
      @accounts="searched[category.id] = $event"
      :key="category.id"
    />
  </div>
</template>

<script>
import AccountList from '@/components/AccountList';

export default {
  components: {
    AccountList
  },
  data() {
    return {
      search: '',
      searched: {
        assets: [],
        liabilities: [],
        budgets: []
      }
    };
  },
  created() {
    this.$ipc.setTitle();
  },
  methods: {
    openSearchedAccount() {
      const searchedAccounts = Object.values(this.searched).filter(
        _ => _.length !== 0
      );
      if (searchedAccounts.length === 1 && searchedAccounts[0].length === 1) {
        const account = searchedAccounts[0][0];
        this.$router.push({
          name: 'account',
          params: {
            accountId: account.id,
            accountCategory: account.category,
            accountType: account.type
          }
        });
      }
    }
  }
};
</script>
