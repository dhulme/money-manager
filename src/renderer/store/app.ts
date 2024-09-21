import { defineStore } from 'pinia';

function initialNewBulkTransaction() {
  return {
    name: '',
    description: '',
    transactions: [],
  };
}

export type AppState = {
  error: string;
  snackbar: {
    message: string;
    active: boolean;
  };
  newBulkTransaction: {
    name: string;
    description: string;
    transactions: any[];
  };
  importedTransactions: any[];
  dialog: any;
  search: string;
  summaryBalance: string;
};

export const appStore = defineStore('app', {
  state: (): AppState => ({
    error: '',
    snackbar: {
      message: '',
      active: false,
    },
    newBulkTransaction: initialNewBulkTransaction(),
    importedTransactions: [],
    dialog: null,
    search: '',
    summaryBalance: '',
  }),
  actions: {
    setSummaryBalance(value: number) {
      this.summaryBalance = value.toString();
    },
    setError(value: string) {
      this.error = value;
      return value;
    },
    setSnackbarActive(value: boolean) {
      this.snackbar.active = value;
    },
    setSnackbarMessage(value: string) {
      this.snackbar.message = value;
    },
    setNewBulkTransaction(value: any) {
      this.newBulkTransaction = value || initialNewBulkTransaction();
    },
    setImportedTransactions(value: any[]) {
      this.importedTransactions = value;
    },
    setDialog(dialog: any) {
      this.dialog = dialog;
    },
    setSearch(value: string) {
      this.search = value;
    },
    openSnackbar(message: string) {
      this.setSnackbarMessage(message);
      this.setSnackbarActive(true);
    },
  },
});
