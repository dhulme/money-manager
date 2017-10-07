<template>
  <div>
    <v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
    <v-data-table :headers="headers" :items="transactions" :search="search"
      :rows-per-page-items="rowsPerPageItems">
      <template slot="items" scope="props">
        <tr>
          <td>{{ props.item.date | date }}</td>
          <td>{{ props.item.description }}</td>
          <td>{{ props.item.note }}</td>
          <td>{{ transactionIn(props.item) | currency }}</td>
          <td>{{ transactionOut(props.item) | currency }}</td>
          <td>{{ $t(`transactionTypes.${props.item.type}`) }}
          <td>{{ transactionAccount(props.item) }}</td>
        </tr>
      </template>
      <template slot="footer">
        <tr v-if="editable" class="new-row">
          <td>
            <v-text-field v-model="transaction.date" label="Date" @keyup.enter="addTransaction"></v-text-field>
          </td>
          <td>
            <v-text-field v-model="transaction.description" label="Description" @keyup.enter="addTransaction"></v-text-field>
          </td>
          <td>
            <v-text-field v-model="transaction.note" label="Note" @keyup.enter="addTransaction"></v-text-field>
          </td>
          <td>
            <v-text-field v-model="transaction.valueIn" label="In" @keyup.enter="addTransaction"></v-text-field>
          </td>
          <td>
            <v-text-field v-model="transaction.valueOut" label="Out" @keyup.enter="addTransaction"></v-text-field>
          </td>
          <td>
            <v-select :items="$project.transactionTypes()" v-model="transaction.type" label="Type"
              item-text="$t(`transactionTypes.${transactionType}`)" item-value="transactionType">
            </v-select>
          </td>
          
          <td>
            <v-select :items="accounts" v-model="transaction.account" label="Account" autocomplete
              item-text="name" item-value="id">
            </v-select>
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="balance">Balance</td>
          <td :class="{ 'red--text': parseFloat(account.balance) < 0 }">
            {{ account.balance | currency }}
          </td>
        </tr>
      </template>
    </v-data-table>
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
    account: '',
    note: '',
    type: 'transfer',
  };

  export default {
    data() {
      return {
        transaction: {
          ...defaultTransaction,
        },
        search: '',
        headers: [{
          text: this.$t('transactions.date'),
          value: 'date',
          align: 'left',
        }, {
          text: this.$t('transactions.description'),
          value: 'description',
          align: 'left',
        }, {
          text: this.$t('transactions.note'),
          value: 'note',
          align: 'left',
        }, {
          text: this.$t('transactions.in'),
          value: 'value',
          align: 'left',
        }, {
          text: this.$t('transactions.out'),
          value: 'value',
          align: 'left',
        }, {
          text: 'Type',
          value: 'type',
          align: 'left',
        }, {
          text: 'Account',
          value: 'account',
          align: 'left',
        }],
        transactions: this.$project.transactions(this.account),
        rowsPerPageItems: [50, 100, {
          text: 'All',
          value: -1,
        }],
      };
    },
    props: {
      editable: Boolean,
      account: Object,
    },
    computed: {
      accounts() {
        return this.$project.sortAccounts(this.$project.accounts().filter(account => account.id !== this.account.id));
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
          return transaction.value;
        }
        return null;
      },
      transactionOut(transaction) {
        if (transaction.from === this.account.id) {
          return transaction.value;
        }
        return null;
      },
      transactionAccount(transaction) {
        let accountId;
        if (transaction.type === 'expense') {
          accountId = transaction.expenseAccount;
        } else if (transaction.to === this.account.id) {
          accountId = transaction.from;
        } else {
          accountId = transaction.to;
        }
        return accountId ? this.$project.account(accountId).name : null;
      },
      addTransaction() {
        const transaction = {
          description: this.transaction.description,
          note: this.transaction.note,
          type: this.transaction.type,
          date: moment(this.transaction.date, dateFormat),
        };

        if (parseFloat(this.transaction.valueIn) < 0 || parseFloat(this.transaction.valueOut) < 0) {
          throw new Error('You cannot enter negative numbers');
        }
        if (this.transaction.valueIn && this.transaction.valueOut) {
          throw new Error('A transaction cannot be both in and out');
        }
        if (!this.transaction.valueIn && !this.transaction.valueOut) {
          throw new Error('A transaction must have a value');
        }

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
    },
  };
</script>

<style lang="scss" scoped>
  .balance {
    text-align: right;
  }

  .new-row /deep/ input {
    width: 100%;
  }
</style>
