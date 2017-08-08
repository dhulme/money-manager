<template>
  <div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Account</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in accounts" :key="account.name" @click="openAccount(account.id)">
          <td class="account-name">{{ account.name }}</td>
          <td class="account-balance">{{ account.balance | currency }}</td>
        </tr>
        <tr>
          <td class="total">Total</td>
          <td>{{ total | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
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
</style>
