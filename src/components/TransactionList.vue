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
        <td>{{ transactionAccount(transaction) }}</td>
      </tr>
      <tr v-if="editable">
        <td><input type="text" v-model="transaction.date" placeholder="Date" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.description" placeholder="Description" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.valueIn" placeholder="In" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.valueOut" placeholder="Out" @keyup.enter="addTransaction"></td>
        <td>
          <select v-model="transaction.accountId">
            <option value="none">None</option>
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

  const dateFormat = 'DD/MM/YYYY';

  export default {
    data() {
      return {
        transaction: {
          date: moment().format(dateFormat),
          description: null,
          valueIn: null,
          valueOut: null,
          accountId: 'none',
        },
        transactions: this.$project.transactions({
          account: this.account,
        }),
      };
    },
    props: {
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
        if (transaction.to === this.account.id) {
          return Math.abs(transaction.value);
        }
        return null;
      },
      transactionOut(transaction) {
        if (transaction.from === this.account.id) {
          return Math.abs(transaction.value);
        }
        return null;
      },
      transactionAccount(transaction) {
        const accountId = transaction.to === this.account.id ? transaction.from : transaction.to;
        return this.$project.account(accountId).name;
      },
      addTransaction() {
        let transaction;
        if (this.transaction.valueIn) {
          transaction = {
            to: this.account.id,
            from: this.transaction.accountId,
            value: parseFloat(this.transaction.valueIn) * 100,
            description: this.transaction.description,
            date: moment(this.transaction.date, dateFormat),
          };
          this.$project.addTransaction(transaction);
        }
        this.transactions.push(transaction);
      },
    },
  };
</script>

