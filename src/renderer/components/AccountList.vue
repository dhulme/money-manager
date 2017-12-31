<template>
  <div>
    <v-text-field
      v-if="enableSearch"
      append-icon="search"
      label="Search"
      single-line
      hide-details
      v-model="search" />
    <v-data-table
      v-show="visible"
      :headers="headers"
      :items="accounts"
      :search="search"
      :pagination.sync="pagination"
    >
      <template slot="items" slot-scope="props">
        <tr @click="openAccount(props.item.id)">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right account-balance" :class="{ 'red--text': parseFloat(props.item.balance) < 0 }">
            {{ props.item.balance | currency }}
          </td>
        </tr>
      </template>
      <template slot="footer">
        <td></td>
        <td class="text-xs-right" :class="{ 'red--text': parseFloat(total) < 0 }">
          {{ total | currency }}
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>

  export default {
    components: {
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
        }],
        pagination: {
          rowsPerPage: -1,
        },
      };
    },
    props: {
      accountType: String,
      enableSearch: Boolean,
      search: {
        type: String,
        default: '',
      },
      hideOnEmpty: {
        type: Boolean,
        default: false,
      }
    },
    computed: {
      accounts() {
        return this.$project.accountsByType(this.accountType);
      },
      total() {
        return this.$project.accountsTotal(this.accounts);
      },
      visible() {
        return this.hideOnEmpty ? this.pagination.totalItems > 0 : true;
      }
    },
    watch: {
      visible(visible) {
        this.$emit('visible', visible);
      },
    },
    methods: {
      openAccount(accountId) {
        const account = this.$project.account(accountId);
        this.$router.push({
          name: 'account',
          params: {
            accountId,
            accountType: account.type,
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .account-name {
    width: 70%;
  }
  
  .account-balance {
    width: 30%;
  }

  .total {
    text-align: right;
  }

  .search {
    text-align: right;
  }
</style>