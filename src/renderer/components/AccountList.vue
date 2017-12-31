<template>
  <v-card class="mb-4" v-show="visible">
    <v-card-title>
      <span class="headline">{{ accountCategory }}</span>
      <v-spacer />
      <v-btn flat color="primary" @click="newAccount">Add</v-btn>
    </v-card-title>

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
  </v-card>
</template>

<script>

  export default {
    props: {
      accountCategory: String,
      search: String,
      hideOnEmpty: Boolean
    },
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
    computed: {
      accounts() {
        return this.$project.accountsByCategory(this.accountCategory);
      },
      total() {
        return this.$project.accountsTotal(this.accounts);
      },
      visible() {
        return this.hideOnEmpty ? this.pagination.totalItems > 0 : true;
      }
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
      openAccount(accountId) {
        const account = this.$project.account(accountId);
        this.$router.push({
          name: 'account',
          params: {
            accountId,
            accountType: account.type,
          },
        });
      }
    }
  };
</script>
