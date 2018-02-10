<template>
  <div>
    <v-text-field
      class="mb-4"
      append-icon="search"
      label="Search"
      single-line
      hide-details
      v-model="search"
    />

    <account-list
      account-category="Assets"
      account-type="asset"
      :search="search"
      hide-on-empty
    />

    <account-list
      account-category="Liabilities"
      account-type="asset"
      :search="search"
      hide-on-empty
    />

    <account-list
      account-category="Budgets"
      account-type="budget"
      :search="search"
      hide-on-empty
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
      };
    },
    created() {
      this.$ipc.setTitle();
    },
  };
</script>

