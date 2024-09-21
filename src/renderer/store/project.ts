import { defineStore } from 'pinia';
import {
  Account,
  AccountCategory,
  BulkTransaction,
  BulkTransactionTransaction,
  Summary,
  Transaction,
} from '../../types';
import Big from 'big.js';
import { getFriendlyId } from '../util';

export type ProjectState = {
  accountCategories: AccountCategory[];
  accounts: Account[];
  transactions: Record<string, Transaction>;
  summary: Summary;
  bulkTransactions: BulkTransaction[];
  bulkTransactionTransactions: Record<string, BulkTransactionTransaction>;
};

type Sortable = {
  name: string;
};

function sortByName(a: Sortable, b: Sortable) {
  if (a.name > b.name) {
    return 1;
  }
  if (a.name < b.name) {
    return -1;
  }
  return 0;
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    accountCategories: [],
    accounts: [],
    transactions: {},
    summary: {
      balance: 0,
    },
    bulkTransactions: [],
    bulkTransactionTransactions: {},
  }),
  actions: {
    init(data: ProjectState) {
      const clonedData: ProjectState = JSON.parse(JSON.stringify(data));

      // Old accounts may not have deleted flag set, which causes reactivity issues if deleted
      if (Array.isArray(clonedData.accounts)) {
        clonedData.accounts.forEach((account) => {
          if (account.deleted === undefined) {
            account.deleted = false;
          }
        });
      }

      this.accounts = clonedData.accounts;
      this.accountCategories = clonedData.accountCategories;
      this.transactions = clonedData.transactions;
      this.summary = clonedData.summary;
      this.bulkTransactions = clonedData.bulkTransactions;
      this.bulkTransactionTransactions = clonedData.bulkTransactionTransactions;
    },

    addTransaction({
      transaction,
      value,
      toAccountId,
      fromAccountId,
    }: {
      transaction: Transaction;
      value: string;
      toAccountId: string;
      fromAccountId: string;
    }) {
      this.transactions[transaction.id] = transaction;
      const fromAccount = this.accounts.find((_) => _.id === fromAccountId);
      if (!fromAccount) {
        throw new Error(`Cannot find 'from' account called ${fromAccountId}`);
      }
      fromAccount.balance = new Big(fromAccount.balance).minus(value);
      fromAccount.transactionIds.push(transaction.id);

      const toAccount = this.accounts.find((_) => _.id === toAccountId);
      if (!toAccount) {
        throw new Error(`Cannot find 'to' account called ${fromAccountId}`);
      }
      toAccount.balance = new Big(toAccount.balance).add(value);
      toAccount.transactionIds.push(transaction.id);

      this.updateSummaryBalance();
    },

    updateTransaction(transaction: Transaction) {
      const currentTransaction = this.transactions[transaction.id];
      if (!currentTransaction) {
        throw new Error(`Cannot find transaction with ID ${transaction.id}`);
      }

      const balanceDifference = new Big(transaction.value).minus(
        currentTransaction.value,
      );

      const fromAccount = this.accounts.find((_) => _.id === transaction.from);
      if (!fromAccount) {
        throw new Error(
          `Cannot find 'from' account called ${transaction.from}`,
        );
      }
      fromAccount.balance = new Big(fromAccount.balance).minus(
        balanceDifference,
      );

      const toAccount = this.accounts.find((_) => _.id === transaction.to);
      if (!toAccount) {
        throw new Error(`Cannot find 'to' account called ${transaction.to}`);
      }
      toAccount.balance = new Big(toAccount.balance).add(balanceDifference);

      this.transactions[transaction.id] = {
        ...transaction,
      };
    },

    updateSummaryBalance() {
      this.summary.balance = this.accounts.reduce((total, account) => {
        if (account.type === 'none') {
          return total;
        }

        if (account.type === 'budget') {
          return total.minus(account.balance);
        }

        return total.plus(account.balance);
      }, new Big(0));
    },

    setAccountDeleted({
      accountId,
      deleted,
    }: {
      accountId: string;
      deleted: boolean;
    }) {
      const account = this.accounts.find((_) => _.id === accountId);
      if (account) {
        account.deleted = deleted;
      }
    },

    addAccount(account: Account) {
      const { name, balance, type, category, importTransactionsFormatId } =
        account;
      const newAccount = {
        transactionIds: [],
        id: getFriendlyId(name),
        balance,
        type,
        category,
        name,
        deleted: false,
        importTransactionsFormatId,
      };
      this.accounts.push(newAccount);
    },

    editAccount(newAccount: Account) {
      const account = this.accounts.find((_) => _.id === newAccount.id);
      if (account) {
        this.accounts.splice(this.accounts.indexOf(account), 1, {
          ...account,
          ...newAccount,
        });
      }
    },

    addAccountCategory(category: AccountCategory) {
      const id = getFriendlyId(category.name);
      this.accountCategories.push({
        id,
        name: category.name,
        type: category.type,
      });
    },

    addBulkTransaction(bulkTransaction: BulkTransaction) {
      const { description, name } = bulkTransaction;
      const newBulkTransaction = {
        name,
        description,
        id: bulkTransaction.id || getFriendlyId(name),
        transactionIds: [],
        lastModified: bulkTransaction.lastModified || new Date(),
      };
      this.bulkTransactions.push(newBulkTransaction);
    },

    updateBulkTransaction(bulkTransaction: BulkTransaction) {
      const { description, name, transactionIds, id } = bulkTransaction;
      const index = this.bulkTransactions.findIndex(
        (_) => _.id === bulkTransaction.id,
      );
      this.bulkTransactions[index] = {
        id,
        name,
        description,
        transactionIds:
          transactionIds || this.bulkTransactions[index].transactionIds,
        lastModified: new Date(),
      };
    },

    addUpdateBulkTransactionTransaction({
      transaction,
      bulkTransaction,
    }: {
      transaction: Transaction;
      bulkTransaction: BulkTransaction;
    }) {
      const { to, from, value, note, id } = transaction;
      this.bulkTransactionTransactions[id] = {
        to,
        from,
        value,
        note,
        id,
      };
      if (!bulkTransaction.transactionIds.includes(id)) {
        bulkTransaction.transactionIds.push(id);
      }
      bulkTransaction.lastModified = new Date();
    },

    deleteBulkTransactionTransaction({
      transaction,
      bulkTransaction,
    }: {
      transaction: Transaction;
      bulkTransaction: BulkTransaction;
    }) {
      const { id } = transaction;
      delete this.bulkTransactionTransactions[id];
      const index = bulkTransaction.transactionIds.indexOf(id);
      if (index !== -1) {
        bulkTransaction.transactionIds.splice(index, 1);
      }
      bulkTransaction.lastModified = new Date();
    },
  },
  getters: {
    accountCategoryItems(state) {
      return state.accountCategories
        .toSorted(sortByName)
        .map((category) => ({ text: category.name, value: category.id }));
    },
    activeAccounts(state) {
      return state.accounts.filter((account) => !account.deleted);
    },
    deletedAccounts(state) {
      return state.accounts.filter((account) => account.deleted);
    },
    accountItems(): { text: string; value: string }[] {
      return this.accounts.toSorted(sortByName).map((account) => ({
        text: account.name,
        value: account.id,
      }));
    },
    accountsByCategory(getters) {
      return (category: string) =>
        getters.accounts
          .filter((account) => account.category === category)
          .sort(sortByName);
    },
    accountsByType() {
      return (type: string) =>
        this.accounts.filter((account) => account.type === type);
    },
    account(state) {
      return (id: string) =>
        state.accounts.find((account) => account.id === id);
    },
    accountByName(state) {
      return (name: string) =>
        state.accounts.find((account) => account.name === name);
    },
    transactionsArray(state) {
      return (account: Account) =>
        account.transactionIds.map((id) => state.transactions[id]);
    },
    transaction(state) {
      return (id: string) => state.transactions[id];
    },
    summaryBalance(state) {
      return state.summary.balance;
    },
    summaryBalanceEqualsZero(state) {
      return new Big(state.summary.balance).eq(0);
    },
    accountsTotal() {
      return (category: string) =>
        this.accountsByCategory(category).reduce(
          (total, account) => total.plus(account.balance),
          new Big(0),
        );
    },
    bulkTransactionsSorted(state) {
      return state.bulkTransactions.sort(
        (a, b) =>
          new Date(b.lastModified || 0).valueOf() -
          new Date(a.lastModified || 0).valueOf(),
      );
    },
    bulkTransaction(state) {
      return (id: string) => state.bulkTransactions.find((_) => _.id === id);
    },
    bulkTransactionTransactionsArray(state) {
      return (bulkTransaction: BulkTransaction) =>
        bulkTransaction.transactionIds.map((id) => ({
          ...state.bulkTransactionTransactions[id],
          id,
        }));
    },
    accountBalance(state) {
      return (account: Account, transactionId: string) => {
        const transactionIds = account.transactionIds.slice(
          account.transactionIds.indexOf(transactionId) + 1,
        );
        return transactionIds.reduce((balance, id) => {
          const transaction = state.transactions[id];
          return transaction.from === account.id
            ? balance.plus(transaction.value)
            : balance.minus(transaction.value);
        }, new Big(account.balance));
      };
    },
  },
});

// window.projectStore = project;
