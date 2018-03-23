<template>
  <div>
    <v-text-field
      v-focus
      v-model="search"
      class="mb-4"
      append-icon="search"
      label="Search"
      single-line
      hide-details
    />

    <account-list
      :search="search"
      account-category="Assets"
      account-type="asset"
      hide-on-empty
    />

    <account-list
      :search="search"
      account-category="Liabilities"
      account-type="asset"
      hide-on-empty
    />

    <account-list
      :search="search"
      account-category="Budgets"
      account-type="budget"
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

