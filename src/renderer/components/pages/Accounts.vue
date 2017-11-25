<template>
  <div>
    <v-text-field class="mb-4" append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
    <account-type-list account-type="asset" :search="search"></account-type-list>
    <account-type-list account-type="liability" :search="search"></account-type-list>
    <account-type-list account-type="budget" :search="search"></account-type-list>
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

