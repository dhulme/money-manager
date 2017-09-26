<template>
  <div>
    <form class="form-inline">
      <div class="row">
        <div class="col-sm-6">
          <new-account-button :account-type="accountType" class="new-account"></new-account-button>
        </div>
        <div class="col-sm-6 filter">
          <input type="text" v-model="filter" class="form-control" placeholder="Filter">
        </div>
      </div>
    </form>
    <v-data-table :headers="headers" :items="accounts">
      <template slot="items" scope="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.balance | currency }}</td>
      </template>
    </v-data-table>
  </div>
      <!-- <tbody>
        <tr v-for="account in accounts" :key="account.name" @click="openAccount(account.id)">
          <td class="account-name">{{ account.name }}</td>
          <td :class="{ 'text-danger': parseFloat(account.balance) < 0 }" class="account-balance">
            {{ account.balance | currency }}
          </td>
        </tr>
        <tr>
          <td class="total">Total</td>
          <td>{{ total | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div> -->
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
        }, {
          text: 'Balance',
          value: 'value',
        }],
        filter: '',
      };
    },
    props: ['accountType'],
    computed: {
      accounts() {
        return this.$project.accountsByType(this.accountType).filter((account) => {
          return account.name.toLowerCase().includes(this.filter.toLowerCase());
        });
      },
      total() {
        return this.$project.accountsTotal(this.accounts);
      },
      items() {

      }
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

  .filter {
    text-align: right;
  }
</style>
