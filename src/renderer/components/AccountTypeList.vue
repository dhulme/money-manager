<template>
  <v-card class="mb-4" v-show="visible">
    <v-card-title>
      <span class="headline">{{ $t(`headings.${accountType}`) }}</span>
      <v-spacer />
      <v-btn flat @click="newAccount">New Account</v-btn>
    </v-card-title>
    <account-list
      :account-type="accountType"
      :search="search" 
      :hide-on-empty="hideOnEmpty"
      @visible="updateVisible"
    />
  </v-card>
</template>

<script>
  import AccountList from '@/components/AccountList';

  export default {
    props: {
      accountType: String,
      search: String,
      hideOnEmpty: Boolean
    },
    components: {
      AccountList,
    },
    data() {
      return {
        visible: true,
      };
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
      },
      updateVisible(visible) {
        this.visible = visible;
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
