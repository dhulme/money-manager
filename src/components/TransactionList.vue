<template>
  <table class="table">
    <thead>
      <tr>
        <th>{{ $t('transactions.date') }}</th>
        <th>{{ $t('transactions.description') }}</th>
        <th>{{ $t('transactions.note') }}</th>
        <th>{{ $t('transactions.in') }}</th>
        <th>{{ $t('transactions.out') }}</th>
        <th>Account</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(transaction, index) in transactions" :key="index">
        <td>{{ transaction.date | date }}</td>
        <td>{{ transaction.description }}</td>
        <td>{{ transaction.note }}</td>
        <td>{{ transactionIn(transaction) | currency }}</td>
        <td>{{ transactionOut(transaction) | currency }}</td>
        <td>{{ transactionAccount(transaction) }}</td>
      </tr>
      <tr v-if="editable">
        <td><input type="text" v-model="transaction.date" placeholder="Date" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.description" placeholder="Description" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.note" placeholder="Note" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.valueIn" placeholder="In" @keyup.enter="addTransaction"></td>
        <td><input type="text" v-model="transaction.valueOut" placeholder="Out" @keyup.enter="addTransaction"></td>
        <td>
          <select v-model="transaction.typeAndAccount">
            <option v-for="account in $project.sortAccounts($project.budgets())" :key="account.id" :value="`expense:${account.id}`">
              Expense: {{ account.name }}
            </option>
            <option v-for="account in $project.sortAccounts($project.accounts())" :key="account.id" :value="`transfer:${account.id}`">
              Transfer: {{ account.name }}
            </option>
          </select>
        </td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="balance">Balance</td>
        <td>{{ account.balance | currency }}</td>
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
          typeAndAccount: 'transfer:none',
          note: null,
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
        const transaction = {
          description: this.transaction.description,
          note: this.transaction.note,
          date: moment(this.transaction.date, dateFormat),
        };

        const expense = this.transaction.typeAndAccount.includes('expense:');
        const accountId = this.transaction.typeAndAccount.split(':')[1];

        if (this.transaction.valueIn) {
          transaction.value = parseFloat(this.transaction.valueIn) * 100;
          transaction.to = this.account.id;
          transaction.from = this.transaction.accountId;
        } else if (this.transaction.valueOut) {
          transaction.value = parseFloat(this.transaction.valueOut) * 100;
          transaction.to = expense ? 'expense' : accountId;
          transaction.from = this.account.id;

          this.$project.addTransaction(transaction);
          this.transactions.push(transaction);
        }

        if (expense) {
          const transaction2 = {};
          Object.assign(transaction2, transaction, {
            from: accountId,
            to: 'expense',
          });
          this.$project.addTransaction(transaction2);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .balance {
    text-align: right;
  }
</style>
