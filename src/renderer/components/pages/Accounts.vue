<template>
  <div>
    <v-text-field
      class="mb-4"
      append-icon="search"
      label="Search"
      single-line
      hide-details
      v-model="search" />

    <account-type-list
      account-type="asset"
      :search="search"
      hide-on-empty />

    <account-type-list
      account-type="liability"
      :search="search"
      hide-on-empty />
      
    <account-type-list
      account-type="budget"
      :search="search"
      hide-on-empty />
  </div>
</template>

<script>
  import AccountTypeList from '@/components/AccountTypeList';

  export default {
    components: {
      AccountTypeList,
    },
    data() {
      return {
        search: '',
      };
    },
  };
</script>

