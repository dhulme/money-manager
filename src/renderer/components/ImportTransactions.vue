<template>
  <v-card title="Import transactions">
    <v-card-text>
      <v-data-table
        density="compact"
        :items="transactions"
        :headers="headers"
        class="import-transactions-table"
        show-first-last-page
        v-model:page="page"
        :items-per-page="itemsPerPage"
        no-data-text="No new transactions found"
      >
        <template v-slot:item="{ item, index }">
          <tr>
            <td>
              <v-text-field hide-details v-model="item.date" variant="underlined" />
            </td>
            <td>
              <v-text-field hide-details v-model="item.description" variant="underlined" />
            </td>
            <td>
              <v-autocomplete
                :items="accounts"
                v-model="item.account"
                class="required"
                hide-details
                :ref="'account' + index"
                @update:model-value="accountChange(index)"
                auto-select-first
                variant="underlined"
              />
            </td>
            <td>
              <v-select
                hide-details
                :items="transactionTypeItems"
                v-model="item.type"
                variant="underlined"
              />
            </td>
            <td>
              <v-text-field
                hide-details
                v-model="item.value"
                :prefix="$currencyPrefix"
                variant="underlined"
              />
            </td>
            <td class="pr-0" >
              <v-checkbox hide-details v-model="item.giftAided" density="compact"  />
            </td>
            <td class="pa-0">
              <v-btn icon @click="removeTransaction(index)" variant="flat"
                ><v-icon>mdi-delete</v-icon></v-btn
              >
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions class="ma-1">
      <v-btn variant="text" @click="completeImport" color="primary">OK</v-btn>
      <v-btn variant="text" @click="confirmCancel">Cancel</v-btn>
    </v-card-actions>
  </v-card>

  <v-dialog v-model="cancelDialogVisible" max-width="400">
    <v-card>
      <v-card-title>Cancel import</v-card-title>
      <v-card-text>Are you sure you want to cancel the import?</v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="cancelDialogVisible = false">No</v-btn>
        <v-btn variant="text" color="primary" @click="$emit('close')">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { format, parse, parseISO, isSameDay } from 'date-fns';
import { getId } from '../util';
import ipc from '../ipc';

export default {
  props: {
    account: Object,
    visible: Boolean,
  },
  emits: ['close'],
  data() {
    return {
      headers: [
        {
          title: 'Date',
          key: 'date',
          width: 150,
        },
        {
          title: 'Description',
          key: 'description',
        },
        {
          title: 'Account',
          key: 'account',
        },
        {
          title: 'In/Out',
          key: 'type',
          width: 100,
        },
        {
          title: 'Value',
          key: 'value',
          width: 150,
        },
        {
          title: 'Gift Aided',
          key: 'giftAided',
          width: 50,
        },
        {
          title: '',
          key: 'actions',
          width: 50,
        },
      ],
      transactions: [],
      transactionTypeItems: [
        {
          title: 'In',
          value: 'in',
        },
        {
          title: 'Out',
          value: 'out',
        },
      ],
      page: 1,
      itemsPerPage: 10,
      importTransactionsDescriptionsGiftAided: [],
      cancelDialogVisible: false,
    };
  },
  computed: {
    importedTransactions() {
      const existingTransactions = this.$store.getters['project/transactions'](
        this.account
      );
      function transactionExists(transaction) {
        return !!existingTransactions.find(
          (existing) =>
            existing.description === transaction.description &&
            Number(existing.value) === transaction.value &&
            isSameDay(parseISO(existing.date), transaction.date instanceof Date ? transaction.date : parseISO(transaction.date))
        );
      }
      return this.$store.state.importedTransactions
        .filter((item) => !transactionExists(item))
        .map((item) => ({
          date: format(item.date instanceof Date ? item.date : parseISO(item.date), this.$dateFormat),
          description: item.description,
          value: item.value.toFixed(2),
          type: item.type,
          giftAided: this.importTransactionsDescriptionsGiftAided.some(
            (description) =>
              item.description.toLowerCase().includes(description.toLowerCase())
          ),
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
    }
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
            date: parse(uiTransaction.date, this.$dateFormat, new Date()).toISOString(),
            id: primaryTransactionId,
            value: uiTransaction.value,
            giftAided: uiTransaction.giftAided,
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
    confirmCancel() {
      this.cancelDialogVisible = true;
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

.import-transactions-table th:last-of-type {
  padding-right: 0;
}
</style>
