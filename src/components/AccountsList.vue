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
        <tr v-for="account in accounts" :key="account.name">
          <td>{{ account.name }}</td>
          <td>{{ account.balance | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    computed: {
      accounts() {
        return this.$project.accounts;
      },
    }
  }
</script>
