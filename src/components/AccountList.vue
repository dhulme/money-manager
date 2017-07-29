<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Account</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in accounts" :key="account.name" @click="openAccount(account.id)">
          <td>{{ account.name }}</td>
          <td>{{ account.balance | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    props: ['type'],
    computed: {
      accounts() {
        return this.$project.accountsByType(this.type);
      },
    },
    methods: {
      openAccount(accountId) {
        const account = this.$project.account(accountId);
        this.$router.push({
          name: account.type,
          params: {
            accountId,
          },
        });
      },
    },
  };
</script>
