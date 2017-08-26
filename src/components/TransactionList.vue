<template>
  <div>
    <form class="form-inline">
      <input type="text" v-model="filter" class="form-control" placeholder="Filter">
    </form>
    <table class="table">
      <thead>
        <tr>
          <th>{{ $t('transactions.date') }}</th>
          <th>{{ $t('transactions.description') }}</th>
          <th>{{ $t('transactions.note') }}</th>
          <th>{{ $t('transactions.in') }}</th>
          <th>{{ $t('transactions.out') }}</th>
          <th>Type</th>
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
          <td>{{ transactionType(transaction) }}
          <td>{{ transactionAccount(transaction) }}</td>
        </tr>
        <tr v-if="editable">
          <td>
            <input type="text" class="form-control" v-model="transaction.date" placeholder="Date" @keyup.enter="addTransaction">
          </td>
          <td>
            <input type="text" class="form-control" v-model="transaction.description" placeholder="Description" @keyup.enter="addTransaction">
          </td>
          <td>
            <input type="text" class="form-control" v-model="transaction.note" placeholder="Note" @keyup.enter="addTransaction">
          </td>
          <td>
            <input type="text" class="form-control" v-model="transaction.valueIn" placeholder="In" @keyup.enter="addTransaction">
          </td>
          <td>
            <input type="text" class="form-control" v-model="transaction.valueOut" placeholder="Out" @keyup.enter="addTransaction">
          </td>
          <td>
            <select v-model="transaction.type" class="form-control">
              <option v-for="transactionType in $project.transactionTypes()" :key="transactionType" :value="transactionType">
                {{ $t(`transactionTypes.${transactionType}`) }}
              </option>
            </select>
          </td>
          
          <td>
            <select v-model="transaction.account" class="form-control">
              <option v-for="account in $project.sortAccounts($project.accounts())" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="balance">Balance</td>
          <td>{{ account.balance | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import moment from 'moment';

  const dateFormat = 'DD/MM/YYYY';
  const defaultTransaction = {
    date: moment().format(dateFormat),
    description: '',
    valueIn: '',
    valueOut: '',
    account: 'none',
    note: '',
    type: 'transfer',
  };

  export default {
    data() {
      return {
        transaction: {
          ...defaultTransaction,
        },
        filter: '',
      };
    },
    props: {
      editable: Boolean,
      account: Object,
    },
    computed: {
      transactions() {
        return this.$project.transactions({
          account: this.account,
        }).filter((transaction) => {
          const filter = this.filter.toLowerCase();
          const description = transaction.description ? transaction.description.toLowerCase() : '';
          const note = transaction.note ? transaction.note.toLowerCase() : '';
          return description.includes(filter) || note.includes(filter);
        });
      },
    },
    methods: {
      resetForm() {
        this.transaction = {
          ...defaultTransaction,
        };
      },
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
          ...this.transaction,
          date: moment(this.transaction.date, dateFormat),
        };

        if (this.transaction.valueIn) {
          transaction.value = this.transaction.valueIn;
          transaction.to = this.account.id;
          transaction.from = this.transaction.account;
        } else if (this.transaction.valueOut) {
          transaction.value = this.transaction.valueOut;
          transaction.to = this.transaction.account;
          transaction.from = this.account.id;
        }

        this.$project.addTransaction(transaction);
        this.transactions.push(transaction);

        this.$store.commit('setSummaryBalance', this.$project.summaryBalance());

        this.resetForm();
      },
      transactionType(transaction) {
        if (transaction.type) {
          return this.$t(`transactionTypes.${transaction.type}`);
        }
        return '';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .balance {
    text-align: right;
  }
</style>
