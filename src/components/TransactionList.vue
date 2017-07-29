<template>
  <table class="table">
    <thead>
      <tr>
        <th>{{ $t('transactions.date') }}</th>
        <th>{{ $t('transactions.description') }}</th>
        <th>{{ $t('transactions.in') }}</th>
        <th>{{ $t('transactions.out') }}</th>
        <th>Account</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="transaction in transactions">
        <td>{{ transaction.date | date }}</td>
        <td>{{ transaction.description }}</td>
        <td>{{ transactionIn(transaction) | currency }}</td>
        <td>{{ transactionOut(transaction) | currency }}</td>
        <td>{{ transaction.to || transaction.from }}</td>
      </tr>
      <tr v-if="editable">
        <td><input type="text" v-model="transaction.date" placeholder="Date" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.description" placeholder="Description"></td>
        <td><input type="text" v-model="transaction.valueIn" placeholder="In"></td>
        <td><input type="text" v-model="transaction.valueOut" placeholder="Out"></td>
        <td>
          <select v-model="transaction.accountId">
            <option disabled value="">Account</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  import moment from 'moment';

  export default {
    data() {
      return {
        transaction: {
          date: moment().format('DD/MM/YYYY'),
          description: null,
          valueIn: null,
          valueOut: null,
          accountId: null,
        },
      };
    },
    props: {
      transactions: Array,
      editable: Boolean,
      account: Object,
    },
    computed: {
      accounts() {
        return this.$project.accounts();
      },
    },
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
      addTransaction() {
        if (this.transaction.valueIn) {
          this.$project.addTransaction({
            to: this.account.id,
            from: this.transaction.accountId,
            value: parseFloat(this.transaction.valueIn) * 100,
            description: this.transaction.description,
            date: moment(this.transaction.date),
          });
        }
      },
    },
  };
</script>

