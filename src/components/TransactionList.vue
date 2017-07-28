<template>
  <table class="table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>In</th>
        <th>Out</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="transaction in transactions">
        <td>{{ transaction.date | date }}</td>
        <td>{{ transaction.description }}</td>
        <td>{{ transactionIn(transaction) | currency }}</td>
        <td>{{ transactionOut(transaction) | currency }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  export default {
    props: ['transactions'],
    methods: {
      transactionIn(transaction) {
        if (transaction.value > 0) {
          return Math.abs(transaction.value);
        }
      },
      transactionOut(transaction) {
        if (transaction.value < 0) {
          return Math.abs(transaction.value);
        }
      },
    }
  }
</script>

