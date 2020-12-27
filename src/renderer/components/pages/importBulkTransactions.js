import { getId } from '../../util';
import { importTransactionsFormats } from '../../import-transactions';

export default {
  computed: {
    importedTransactions() {
      return this.$store.state.importedTransactions;
    },
  },
  watch: {
    importedTransactions(transactions) {
      const missingAccountNames = new Set();
      const replacedTransactionAccountNames = [];
      let count = 0;
      transactions.forEach((transaction) => {
        const from = this.$store.getters['project/accountByName'](
          transaction.fromName
        )?.id;
        const to = this.$store.getters['project/accountByName'](
          transaction.toName
        )?.id;

        if (!from) {
          missingAccountNames.add(transaction.fromName);
        }
        if (!to) {
          missingAccountNames.add(transaction.toName);
        }
        if (from && to && transaction.value) {
          const newTransaction = {
            id: getId(),
            from,
            to,
            value: transaction.value.toString(),
            note: transaction.note,
          };
          const existingTransactionIndex = this.transactions.findIndex(
            (_) =>
              _.to === newTransaction.to &&
              _.from === newTransaction.from &&
              (!_.note || _.note === newTransaction.note)
          );
          count++;
          if (existingTransactionIndex !== -1) {
            this.transactions.splice(
              existingTransactionIndex,
              1,
              newTransaction
            );
            replacedTransactionAccountNames.push(
              `${newTransaction.from} to ${newTransaction.to}`
            );
          } else {
            this.transactions.push(newTransaction);
          }
        }
      });
      if (missingAccountNames.size) {
        this.$store.commit(
          'setError',
          `Accounts named ${[...missingAccountNames].join(
            ', '
          )} could not be found`
        );
      }
      if (replacedTransactionAccountNames.length) {
        this.$store.dispatch(
          'openSnackbar',
          `Imported ${count} transactions (replaced: ${replacedTransactionAccountNames.join(
            ', '
          )})`
        );
      } else {
        this.$store.dispatch('openSnackbar', `Imported ${count} transactions`);
      }
    },
  },
  methods: {
    importTransactions() {
      this.$ipc.importTransactions(
        importTransactionsFormats.find(
          (format) => format.id === 'moneyManagerBulkTransactions'
        )
      );
    },
  },
};
