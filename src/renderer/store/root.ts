import { defineStore } from 'pinia';
import type { ImportedTransaction } from '../../types/project';

interface NewBulkTransaction {
  name: string;
  description: string;
  transactions: unknown[];
}

function initialNewBulkTransaction(): NewBulkTransaction {
  return {
    name: '',
    description: '',
    transactions: [],
  };
}

export const useRootStore = defineStore('root', {
  state: () => ({
    error: '' as string,
    snackbar: {
      message: '' as string,
      active: false,
    },
    newBulkTransaction: initialNewBulkTransaction() as NewBulkTransaction,
    importedTransactions: [] as ImportedTransaction[],
    dialog: null as string | null,
    search: '' as string,
  }),
  actions: {
    setError(value: string) {
      this.error = value;
    },
    setSnackbarActive(value: boolean) {
      this.snackbar.active = value;
    },
    setSnackbarMessage(value: string) {
      this.snackbar.message = value;
    },
    setNewBulkTransaction(value?: NewBulkTransaction) {
      this.newBulkTransaction = value || initialNewBulkTransaction();
    },
    setImportedTransactions(value: ImportedTransaction[]) {
      this.importedTransactions = value;
    },
    setDialog(dialog: string | null) {
      this.dialog = dialog;
    },
    setSearch(value: string) {
      this.search = value;
    },
    openSnackbar(message: string) {
      this.snackbar.message = message;
      this.snackbar.active = true;
    },
  },
});
