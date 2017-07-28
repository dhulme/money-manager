<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Budget</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="budget in budgets" :key="budget.name">
          <td>{{ budget.name }}</td>
          <td>{{ budget.balance | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    computed: {
      budgets() {
        return this.$project.budgets;
      },
    }
  }
</script>
