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
        <tr v-for="budget in budgets" :key="budget.id" @click="openBudget(budget.id)">
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
        return this.$project.budgets();
      },
    },
    methods: {
      openBudget(budgetId) {
        this.$router.push({
          name: 'budget',
          params: {
            budgetId,
          },
        });
      },
    },
  };
</script>
