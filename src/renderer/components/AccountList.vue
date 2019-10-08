<template>
  <VCard
    v-show="visible"
    class="mb-4"
  >
    <VCardTitle>
      <span class="headline">{{ accountCategory }}</span>
      <VSpacer />
      <VBtn
        v-hotkey.add="newAccount"
        flat
        color="primary"
        @click="newAccount"
      >Add</VBtn>
    </VCardTitle>

    <VDataTable
      v-show="visible"
      ref="dataTable"
      :headers="headers"
      :items="accounts"
      :search="search"
      :pagination.sync="pagination"
    >
      <template
        slot-scope="props"
        slot="items"
      >
        <tr @click="openAccount(props.item.id)">
          <td>{{ props.item.name }}</td>
          <td
            :class="{ 'red--text': parseFloat(props.item.balance) < 0 }"
            class="text-xs-right account-balance"
          >
            {{ props.item.balance | currency }}
          </td>
        </tr>
      </template>
      <template slot="footer">
        <td/>
        <td
          :class="{ 'red--text': parseFloat(total) < 0 }"
          class="text-xs-right"
        >
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
      hideOnEmpty: Boolean,
    },
    data() {
      return {
        headers: [{
          text: 'Account',
          value: 'name',
          align: 'left',
        }, {
          text: 'Balance',
          value: 'balance',
          align: 'right',
        }],
        pagination: {
          rowsPerPage: -1,
        },
      };
    },
    computed: {
      accounts() {
        return this.$store.getters['project/accountsByCategory'](this.accountCategory);
      },
      total() {
        return this.$store.getters['project/accountsTotal'](this.accountCategory);
      },
      visible() {
        return this.hideOnEmpty ? this.pagination.totalItems > 0 : true;
      },
    },
    watch: {
      'pagination.totalItems': function handler() {
        this.$emit('searched', this.$refs.dataTable.filteredItems);
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
        const account = this.$store.getters['project/account'](accountId);
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
  };
</script>
