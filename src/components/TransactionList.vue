<template>
  <table class="table">
    <thead>
      <tr>
        <th>{{ $t('transactions.date') }}</th>
        <th>{{ $t('transactions.description') }}</th>
        <th>{{ $t('transactions.in') }}</th>
        <th>{{ $t('transactions.out') }}</th>
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

