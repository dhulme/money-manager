<template>
  <div>
    <v-spacer></v-spacer>
    <v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
    <v-data-table :headers="headers" :items="accounts" :search="search" :pagination.sync="pagination">
      <template slot="items" scope="props">
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
  import NewAccountButton from '@/components/NewAccountButton';

  export default {
    components: {
      NewAccountButton,
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
        search: '',
        pagination: {
          rowsPerPage: -1,
        },
      };
    },
    props: ['accountType'],
    computed: {
      accounts() {
        return this.$project.accountsByType(this.accountType);
      },
      total() {
        return this.$project.accountsTotal(this.accounts);
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
