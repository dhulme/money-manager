<template>
  <VCard>
    <VCardTitle class="headline">Import transactions</VCardTitle>
    <VCardText>
      <VDataTable
        dense
        :items="transactions"
        :headers="headers"
        class="import-transactions-table"
        :footer-props="{ showFirstLastPage: true }"
        :page.sync="page"
        :items-per-page="itemsPerPage"
        no-data-text="No new transactions found"
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
                auto-select-first
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
            <td class="pr-0">
              <VCheckbox hide-details v-model="props.item.giftAided" dense />
            </td>
            <td class="pa-0 pt-2">
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
import moment from 'moment';
import { getId } from '../util';
import ipc from '../ipc';

export default {
  props: {
    account: Object,
    visible: Boolean,
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
          text: 'Gift Aided',
          value: 'giftAided',
          width: 100,
        },
        {
          text: '',
          value: 'actions',
          width: 50,
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
      page: 1,
      itemsPerPage: 10,
      importTransactionsDescriptionsGiftAided: [],
    };
  },
  computed: {
    importedTransactions() {
      const dateFilter = Vue.filter('date');
      const existingTransactions = this.$store.getters['project/transactions'](
        this.account,
      );
      function transactionExists(transaction) {
        return !!existingTransactions.find(
          (existing) =>
            existing.description === transaction.description &&
            Number(existing.value) === transaction.value &&
            moment(existing.date).isSame(transaction.date, 'day'),
        );
      }
      return this.$store.state.importedTransactions
        .filter((item) => !transactionExists(item))
        .map((item) => ({
          date: dateFilter(item.date),
          description: item.description,
          value: item.value.toFixed(2),
          type: item.type,
          giftAided: this.importTransactionsDescriptionsGiftAided.some(
            (description) =>
              item.description
                .toLowerCase()
                .includes(description.toLowerCase()),
          ),
        }));
    },
    accounts() {
      return this.$store.getters['project/accountItems'].filter(
        (account) => account.value !== this.account.id,
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
    visible: {
      async handler(value) {
        if (value) {
          const { importTransactionsDescriptionsGiftAided } =
            await ipc.getSettings();
          this.importTransactionsDescriptionsGiftAided =
            importTransactionsDescriptionsGiftAided;
        }
      },
      immediate: true,
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
            giftAided: uiTransaction.giftAided,
          };

          const transactionAccount = this.$store.getters['project/account'](
            uiTransaction.account,
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
        `${transactions.length || 'No'} transactions imported`,
      );
    },
    accountChange(index) {
      const nextAccountSelect = this.$refs['account' + (index + 1)];
      if (nextAccountSelect) {
        nextAccountSelect.focus();
        nextAccountSelect.activateMenu();
      } else if (this.page * this.itemsPerPage < this.transactions.length) {
        this.$nextTick(() => {
          this.page++;
          this.$refs.account0.focus();
          this.$refs.account0.activateMenu();
        });
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
