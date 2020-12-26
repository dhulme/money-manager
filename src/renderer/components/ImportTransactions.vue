<template>
  <VCard>
    <VCardTitle class="headline">Import transactions</VCardTitle>
    <VCardText>
      <p>Only transactions with an account selected will be imported</p>
      <VDataTable
        dense
        :items="transactions"
        :headers="headers"
        class="import-transactions-table"
        :footer-props="{ showFirstLastPage: true }"
      >
        <template v-slot:item="props">
          <tr>
            <td>
              <VTextField hide-details v-model="props.item.date" />
            </td>
            <td>
              <VTextField hide-details v-model="props.item.description" />
            </td>
            <td>
              <VAutocomplete
                :items="accounts"
                v-model="props.item.account"
                class="required"
                hide-details
                :ref="'account' + props.index"
                @change="accountChange(props.index)"
              />
            </td>
            <td>
              <VSelect
                hide-details
                :items="transactionTypeItems"
                v-model="props.item.type"
              />
            </td>
            <td>
              <VTextField
                hide-details
                v-model="props.item.value"
                :prefix="$currencyPrefix"
              />
            </td>
            <td class="pa-0 pt-3">
              <VBtn icon @click="removeTransaction(props.index)"
                ><VIcon>delete</VIcon></VBtn
              >
            </td>
          </tr>
        </template>
      </VDataTable>
    </VCardText>
    <VCardActions>
      <VBtn text @click="completeImport" color="primary">OK</VBtn>
      <VBtn text @click="$emit('close')">Cancel</VBtn>
    </VCardActions>
  </VCard>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
import { getId } from '../util';

export default {
  props: {
    account: Object,
  },
  data() {
    return {
      headers: [
        {
          text: 'Date',
          value: 'date',
          width: 150,
        },
        {
          text: 'Description',
          value: 'description',
        },
        {
          text: 'Account',
          value: 'account',
        },
        {
          text: 'In/Out',
          value: 'type',
          width: 100,
        },
        {
          text: 'Value',
          value: 'value',
          width: 150,
        },
        {
          text: '',
          value: 'actions',
        },
      ],
      transactions: [],
      transactionTypeItems: [
        {
          text: 'In',
          value: 'in',
        },
        {
          text: 'Out',
          value: 'out',
        },
      ],
    };
  },
  computed: {
    importedTransactions() {
      const dateFilter = Vue.filter('date');
      const existingTransactions = this.$store.getters['project/transactions'](
        this.account
      );
      function transactionExists(transaction) {
        return !!existingTransactions.find(
          (existing) =>
            existing.description === transaction.description &&
            Number(existing.value) === transaction.value &&
            moment(existing.date).isSame(transaction.date, 'day')
        );
      }
      return this.$store.state.importedTransactions
        .filter((item) => !transactionExists(item))
        .map((item) => ({
          date: dateFilter(item.date),
          description: item.description,
          value: item.value.toFixed(2),
          type: item.type,
        }));
    },
    accounts() {
      return this.$store.getters['project/accountItems'].filter(
        (account) => account.value !== this.account.id
      );
    },
  },
  watch: {
    importedTransactions: {
      immediate: true,
      handler(value) {
        this.transactions = value;
      },
    },
  },
  methods: {
    completeImport() {
      const transactions = this.transactions
        .map((uiTransaction) => {
          const primaryTransactionId = getId();
          const secondaryTransactionId = getId();

          const transaction = {
            description: uiTransaction.description,
            note: 'Imported',
            date: moment(uiTransaction.date, this.$dateFormat),
            id: primaryTransactionId,
            value: uiTransaction.value,
          };

          const transactionAccount = this.$store.getters['project/account'](
            uiTransaction.account
          );

          // If no account given, skip this transaction
          if (!transactionAccount) {
            return;
          }

          const inTransaction = uiTransaction.type === 'in';
          const isDualTransaction =
            transactionAccount.type !== this.account.type;

          return {
            primary: isDualTransaction
              ? {
                  ...transaction,
                  expense: uiTransaction.account,
                  linkedTransaction: secondaryTransactionId,
                  from: inTransaction ? 'none' : this.account.id,
                  to: inTransaction ? this.account.id : 'none',
                }
              : {
                  ...transaction,
                  from: inTransaction ? uiTransaction.account : this.account.id,
                  to: inTransaction ? this.account.id : uiTransaction.account,
                },
            ...(isDualTransaction && {
              secondary: {
                ...transaction,
                expense: this.account.id,
                linkedTransaction: primaryTransactionId,
                from: inTransaction ? 'none' : uiTransaction.account,
                to: inTransaction ? uiTransaction.account : 'none',
                id: secondaryTransactionId,
              },
            }),
          };
        })
        .filter((transaction) => !!transaction);

      this.$store.dispatch('project/addDualTransactions', transactions);
      this.$emit('close');
      this.$store.dispatch(
        'openSnackbar',
        `${transactions.length || 'No'} transactions imported`
      );
    },
    accountChange(index) {
      const nextAccountSelect = this.$refs['account' + (index + 1)];
      if (nextAccountSelect) {
        nextAccountSelect.focus();
        nextAccountSelect.activateMenu();
      }
    },
    removeTransaction(index) {
      this.$store.state.importedTransactions.splice(index, 1);
    },
  },
};
</script>

<style lang="scss">
.import-transactions-table td {
  border-bottom: none !important;
}

.import-transactions-table .v-data-footer {
  margin-top: 0.5rem;
}
</style>
