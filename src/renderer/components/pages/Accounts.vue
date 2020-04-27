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

    <VBtn text @click="restoreDeletedAccountsDialogVisible = true"
      >Restore deleted accounts</VBtn
    >

    <VDialog v-model="restoreDeletedAccountsDialogVisible" max-width="400">
      <RestoreDeletedAccounts
        @close="restoreDeletedAccountsDialogVisible = false"
      />
    </VDialog>
  </div>
</template>

<script>
import AccountList from '@/components/AccountList';
import RestoreDeletedAccounts from '@/components/RestoreDeletedAccounts';

export default {
  components: {
    AccountList,
    RestoreDeletedAccounts
  },
  data() {
    return {
      searched: {
        assets: [],
        liabilities: [],
        budgets: []
      },
      restoreDeletedAccountsDialogVisible: false
    };
  },
  created() {
    this.$ipc.setTitle();
  },
  computed: {
    search: {
      get() {
        return this.$store.state.search;
      },
      set(value) {
        this.$store.commit('setSearch', value);
      }
    }
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
