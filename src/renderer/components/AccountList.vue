<template>
  <VCard v-show="visible" class="mb-4">
    <VCardTitle>
      <span class="headline">{{ accountCategory }}</span>
      <VSpacer />
      <VBtn v-hotkey.add="newAccount" text color="primary" @click="newAccount"
        >Add</VBtn
      >
    </VCardTitle>

    <VDataTable
      v-show="visible"
      ref="dataTable"
      :headers="headers"
      :items="accounts"
      disable-pagination
      hide-default-footer
    >
      <template v-slot:item="props">
        <tr @click="openAccount(props.item.id)">
          <td>{{ props.item.name }}</td>
          <td
            :class="{ 'red--text': parseFloat(props.item.balance) < 0 }"
            class="text-right account-balance"
          >
            {{ props.item.balance | currency }}
          </td>
        </tr>
      </template>
      <template v-slot:body.append>
        <td />
        <td :class="{ 'red--text': parseFloat(total) < 0 }" class="balance">
          {{ total | currency }}
        </td>
      </template>
    </VDataTable>
  </VCard>
</template>

<script>
export default {
  props: {
    accountCategory: String,
    accountType: String,
    search: String,
    hideOnEmpty: Boolean
  },
  data() {
    return {
      headers: [
        {
          text: 'Account',
          value: 'name',
          align: 'left'
        },
        {
          text: 'Balance',
          value: 'balance',
          align: 'right'
        }
      ]
    };
  },
  computed: {
    accounts() {
      const accounts = this.$store.getters['project/accountsByCategory'](
        this.accountCategory
      );
      return accounts.filter(account =>
        account.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    total() {
      return this.$store.getters['project/accountsTotal'](this.accountCategory);
    },
    visible() {
      return this.hideOnEmpty ? this.accounts.length > 0 : true;
    }
  },
  methods: {
    newAccount() {
      this.$router.push({
        name: 'newAccount',
        params: {
          accountId: 'new',
          accountCategory: this.accountCategory,
          accountType: this.accountType
        }
      });
    },
    openAccount(accountId) {
      const account = this.$store.getters['project/account'](accountId);
      this.$router.push({
        name: 'account',
        params: {
          accountId,
          accountCategory: account.category,
          accountType: account.type
        }
      });
    }
  },
  watch: {
    accounts(accounts) {
      this.$emit('accounts', accounts);
    }
  }
};
</script>

<style lang="scss" scoped>
.balance {
  font-size: 0.875rem;
  height: 48px;
  padding: 0 1rem;
  text-align: right;
  font-weight: 500;
}
</style>
