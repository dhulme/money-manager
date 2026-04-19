<template>
  <v-card v-show="visible" class="mb-4">
    <v-card-title>
      <VRow class="my-1 mx-0">
        <span class="text-h6">{{ accountCategory }}</span>
        <v-spacer />
        <v-btn
          v-hotkey.add="newAccount"
          variant="text"
          color="primary"
          @click="newAccount"
          >Add</v-btn
        >
      </VRow>
    </v-card-title>

    <v-data-table
      v-show="visible"
      ref="dataTable"
      :headers="headers"
      :items="accounts"
      :items-per-page="-1"
      hide-default-footer
    >
      <template v-slot:item="{ item }">
        <tr @click="openAccount(item.id)">
          <td>{{ item.name }}</td>
          <td
            :class="{ 'text-red': parseFloat(item.balance) < 0 }"
            class="text-right account-balance"
          >
            {{ $currency(item.balance) }}
          </td>
        </tr>
      </template>
      <template v-slot:tfoot>
        <tfoot>
          <tr>
            <td />
            <td :class="{ 'text-red': parseFloat(total) < 0 }" class="balance">
              {{ $currency(total) }}
            </td>
          </tr>
        </tfoot>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { useProjectStore } from '../store/project';

export default {
  props: {
    accountCategory: String,
    accountType: String,
    search: String,
    hideOnEmpty: Boolean,
    showPositive: Boolean,
  },
  setup() {
    return { projectStore: useProjectStore() };
  },
  data() {
    return {
      headers: [
        { title: 'Account', key: 'name', align: 'start' },
        { title: 'Balance', key: 'balance', align: 'end' },
      ],
    };
  },
  computed: {
    accounts() {
      const accounts = this.projectStore.accountsByCategory(
        this.accountCategory,
      );
      return accounts.filter(
        (account) =>
          account.name.toLowerCase().includes(this.search.toLowerCase()) &&
          (this.showPositive || account.balance < 0),
      );
    },
    total() {
      return this.projectStore.accountsTotal(this.accountCategory);
    },
    visible() {
      return this.hideOnEmpty ? this.accounts.length > 0 : true;
    },
  },
  methods: {
    newAccount() {
      this.$router.push({
        name: 'newAccount',
        params: {
          accountId: 'new',
          accountCategory: this.accountCategory,
          accountType: this.accountType,
        },
      });
    },
    openAccount(accountId) {
      const account = this.projectStore.getAccount(accountId);
      this.$router.push({
        name: 'account',
        params: {
          accountId,
          accountCategory: account.category,
          accountType: account.type,
        },
      });
    },
  },
  watch: {
    accounts(accounts) {
      this.$emit('accounts', accounts);
    },
  },
};
</script>

<style lang="scss" scoped>
.balance {
  font-size: 0.875rem;
  height: 48px;
  padding: 0 1rem;
  text-align: right;
  font-weight: 600;
}

:deep(thead th) {
  color: rgba(0, 0, 0, 0.6) !important;
}
</style>
