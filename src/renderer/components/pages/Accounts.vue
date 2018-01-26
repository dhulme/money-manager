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
      :search="search"
      hide-on-empty
    />

    <account-list
      account-category="Liabilities"
      :search="search"
      hide-on-empty 
    />
      
    <account-list
      account-category="Budgets"
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
    created() {
      this.$ipc.setTitle();
    },
    data() {
      return {
        search: '',
      };
    },
  };
</script>

