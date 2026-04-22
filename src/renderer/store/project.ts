import { defineStore } from 'pinia';
import Big from 'big.js';

import { requireObjectProperties, required, getFriendlyId } from '../util';
import type {
  Account,
  AccountCategory,
  BulkTransaction,
  BulkTransactionTransaction,
  ProjectData,
  Summary,
  Transaction,
} from '../../types/project';

function sortByName<T extends { name: string }>(a: T, b: T): number {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}

export interface ProjectState {
  accountCategories: AccountCategory[];
  accounts: Account[];
  transactions: Record<string, Transaction>;
  summary: Summary;
  bulkTransactions: BulkTransaction[];
  bulkTransactionTransactions: Record<string, BulkTransactionTransaction>;
}

function getAddTransactionParams(transaction: Record<string, unknown>) {
  requireObjectProperties(transaction, ['value', 'to', 'from']);
  return {
    transaction: {
      ...transaction,
      highlighted: false,
    } as Transaction,
    value: transaction.value as string,
    toAccountId: transaction.to as string,
    fromAccountId: transaction.from as string,
  };
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    accountCategories: [],
    accounts: [],
    transactions: {},
    summary: {
      balance: '0',
    },
    bulkTransactions: [],
    bulkTransactionTransactions: {},
  }),

  getters: {
    accountCategories_: (state): AccountCategory[] => state.accountCategories,
    accountCategoryItems: (state) =>
      state.accountCategories
        .slice()
        .sort(sortByName)
        .map((category) => ({ title: category.name, value: category.id })),
    activeAccounts: (state): Account[] =>
      state.accounts.filter((account) => !account.deleted),
    deletedAccounts: (state): Account[] =>
      state.accounts.filter((account) => account.deleted),
    accountItems(): { title: string; value: string }[] {
      return this.activeAccounts
        .slice()
        .sort(sortByName)
        .map((account) => ({ title: account.name, value: account.id }));
    },
    summaryBalance: (state) => state.summary.balance,
    summaryBalanceEqualsZero: (state) => new Big(state.summary.balance).eq(0),
    sortedBulkTransactions: (state): BulkTransaction[] =>
      state.bulkTransactions.slice().sort(
        (a, b) =>
          new Date(b.lastModified || 0).valueOf() -
          new Date(a.lastModified || 0).valueOf()
      ),
  },

  actions: {
    // ---- Init ----
    init(data: ProjectData) {
      const clonedData = JSON.parse(JSON.stringify(data)) as ProjectData;

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

    // ---- Getter-like helpers (return functions) ----
    accountsByCategory(category: string): Account[] {
      return this.activeAccounts
        .filter((account) => account.category === category)
        .sort(sortByName);
    },
    accountsByType(type: string): Account[] {
      return this.activeAccounts.filter((account) => account.type === type);
    },
    getAccount(id: string): Account | undefined {
      return this.accounts.find((account) => account.id === id);
    },
    getAccountByName(name: string): Account | undefined {
      return this.accounts.find((account) => account.name === name);
    },
    getTransactions(account: Account): Transaction[] {
      return account.transactionIds.map((id) => this.transactions[id]);
    },
    getTransaction(id: string): Transaction {
      return this.transactions[id];
    },
    accountsTotal(category: string): Big {
      return this.accountsByCategory(category)
        .reduce((total, account) => total.plus(account.balance), new Big(0));
    },
    getBulkTransaction(id: string): BulkTransaction | undefined {
      return this.bulkTransactions.find((_) => _.id === id);
    },
    getBulkTransactionTransactions(bulkTransaction: BulkTransaction): (BulkTransactionTransaction & { id: string })[] {
      return bulkTransaction.transactionIds.map((id) => ({
        ...this.bulkTransactionTransactions[id],
        id,
      }));
    },
    getAccountBalance(account: Account, transactionId: string): Big {
      const transactionIds = account.transactionIds.slice(
        account.transactionIds.indexOf(transactionId) + 1
      );
      return transactionIds.reduce((balance, id) => {
        const transaction = this.transactions[id];
        return transaction.from === account.id
          ? balance.plus(transaction.value)
          : balance.minus(transaction.value);
      }, new Big(account.balance));
    },

    // ---- Mutations ----
    _addTransaction({
      transaction = required('transaction'),
      value = required('value'),
      toAccountId = required('toAccountId'),
      fromAccountId = required('fromAccountId'),
    }: {
      transaction: Transaction;
      value: string;
      toAccountId: string;
      fromAccountId: string;
    }) {
      requireObjectProperties(transaction as unknown as Record<string, unknown>, ['id', 'value', 'from', 'to']);

      this.transactions[transaction.id] = transaction;
      const fromAccount = this.accounts.find((_) => _.id === fromAccountId);
      if (!fromAccount) {
        throw new Error(`Cannot find 'from' account called ${fromAccountId}`);
      }
      fromAccount.balance = new Big(fromAccount.balance).minus(value).toString();
      fromAccount.transactionIds.push(transaction.id);

      const toAccount = this.accounts.find((_) => _.id === toAccountId);
      if (!toAccount) {
        throw new Error(`Cannot find 'to' account called ${toAccountId}`);
      }
      toAccount.balance = new Big(toAccount.balance).add(value).toString();
      toAccount.transactionIds.push(transaction.id);
    },

    _updateTransaction(transaction: Transaction) {
      requireObjectProperties(transaction as unknown as Record<string, unknown>, ['id', 'value', 'from', 'to']);
      const currentTransaction = this.transactions[transaction.id];
      if (!currentTransaction) {
        throw new Error(`Cannot find transaction with ID ${transaction.id}`);
      }

      const balanceDifference = new Big(transaction.value).minus(
        currentTransaction.value
      );

      const fromAccount = this.accounts.find((_) => _.id === transaction.from);
      if (!fromAccount) {
        throw new Error(`Cannot find 'from' account called ${transaction.from}`);
      }
      fromAccount.balance = new Big(fromAccount.balance).minus(balanceDifference).toString();

      const toAccount = this.accounts.find((_) => _.id === transaction.to);
      if (!toAccount) {
        throw new Error(`Cannot find 'to' account called ${transaction.to}`);
      }
      toAccount.balance = new Big(toAccount.balance).add(balanceDifference).toString();

      this.transactions = {
        ...this.transactions,
        [transaction.id]: { ...transaction },
      };
    },

    updateSummaryBalance() {
      this.summary.balance = this.accounts
        .reduce((total, account) => {
          if (account.type === 'none') return total;
          if (account.type === 'budget') return total.minus(account.balance);
          return total.plus(account.balance);
        }, new Big(0))
        .toString();
    },

    // ---- Actions (public API) ----
    addTransaction(transaction: Record<string, unknown>) {
      this._addTransaction(getAddTransactionParams(transaction));
      this.updateSummaryBalance();
    },

    addDualTransaction({ primary, secondary }: { primary: Record<string, unknown>; secondary?: Record<string, unknown> }) {
      this._addTransaction(getAddTransactionParams(primary));
      if (secondary) {
        this._addTransaction(getAddTransactionParams(secondary));
      }
      this.updateSummaryBalance();
    },

    addDualTransactions(transactions: { primary?: Record<string, unknown>; secondary?: Record<string, unknown> }[]) {
      transactions.forEach(({ primary, secondary } = {}) => {
        if (primary) {
          this._addTransaction(getAddTransactionParams(primary));
        }
        if (secondary) {
          this._addTransaction(getAddTransactionParams(secondary));
        }
      });
      this.updateSummaryBalance();
    },

    updateTransaction(transaction: Transaction) {
      this._updateTransaction(transaction);
      this.updateSummaryBalance();
    },

    updateDualTransaction({ primary, secondary }: { primary: Transaction; secondary: Transaction }) {
      this._updateTransaction(primary);
      this._updateTransaction(secondary);
      this.updateSummaryBalance();
    },

    deleteAccount(accountId: string) {
      const account = this.accounts.find((_) => _.id === accountId);
      if (account) account.deleted = true;
      this.updateSummaryBalance();
    },

    restoreDeletedAccount(accountId: string) {
      const account = this.accounts.find((_) => _.id === accountId);
      if (account) account.deleted = false;
      this.updateSummaryBalance();
    },

    setAccountDeleted(params: { accountId?: string; deleted?: boolean } = {}) {
      const { accountId = required('accountId'), deleted = required('deleted') } = params;
      const account = this.accounts.find((_) => _.id === accountId);
      if (account) account.deleted = deleted;
    },

    addAccount({
      name,
      balance,
      type,
      category,
      importTransactionsFormatId,
    }: {
      name: string;
      balance: string;
      type: string;
      category: string;
      importTransactionsFormatId?: string;
    }) {
      requireObjectProperties({ name, balance, type, category }, ['name', 'balance', 'type', 'category']);
      this.accounts.push({
        transactionIds: [],
        id: getFriendlyId(name),
        balance,
        type: type as Account['type'],
        category,
        name,
        deleted: false,
        importTransactionsFormatId,
      });
    },

    editAccount({ id, name, importTransactionsFormatId }: { id: string; name: string; importTransactionsFormatId?: string }) {
      requireObjectProperties({ name, id }, ['name', 'id']);
      const account = this.accounts.find((_) => _.id === id);
      if (account) {
        const index = this.accounts.indexOf(account);
        this.accounts.splice(index, 1, {
          ...account,
          name,
          importTransactionsFormatId,
        });
      }
    },

    addAccountCategory({ name, type }: { name: string; type: string }) {
      requireObjectProperties({ name, type }, ['name', 'type']);
      const id = getFriendlyId(name);
      this.accountCategories.push({
        id,
        name,
        type: type as AccountCategory['type'],
      });
    },

    // ---- Bulk Transaction Actions ----
    addBulkTransaction({
      description = required('description'),
      name = required('name'),
      transactions = required('transactions'),
    }: {
      description: string;
      name: string;
      transactions: { to: string; from: string; value: string; note?: string; id: string }[];
    }) {
      const id = getFriendlyId(name);
      this.bulkTransactions.push({
        name,
        description,
        id,
        transactionIds: [],
        lastModified: new Date().toISOString(),
      });
      const bulkTransaction = this.bulkTransactions.find((_) => _.id === id)!;
      transactions.forEach((transaction) =>
        this._addUpdateBulkTransactionTransaction({
          bulkTransaction,
          transaction,
        })
      );
    },

    updateBulkTransaction({
      id,
      description,
      name,
      transactions,
    }: {
      id: string;
      description: string;
      name: string;
      transactions?: { to: string; from: string; value: string; note?: string; id: string }[];
    }) {
      const index = this.bulkTransactions.findIndex((_) => _.id === id);
      if (index !== -1) {
        this.bulkTransactions[index] = {
          id,
          name,
          description,
          transactionIds: transactions ? [] : this.bulkTransactions[index].transactionIds,
          lastModified: new Date().toISOString(),
        };
      }
      if (transactions) {
        const bulkTransaction = this.bulkTransactions.find((_) => _.id === id)!;
        transactions.forEach((transaction) =>
          this._addUpdateBulkTransactionTransaction({
            bulkTransaction,
            transaction,
          })
        );
      }
    },

    deleteBulkTransaction(id: string) {
      const bulkTransaction = this.bulkTransactions.find((_) => _.id === id);
      if (bulkTransaction) {
        bulkTransaction.transactionIds.forEach((transactionId) => {
          delete this.bulkTransactionTransactions[transactionId];
        });
      }
      const index = this.bulkTransactions.findIndex((_) => _.id === id);
      if (index !== -1) {
        this.bulkTransactions.splice(index, 1);
      }
    },

    runBulkTransactionTransactions({
      bulkTransaction,
      transactions,
    }: {
      bulkTransaction: BulkTransaction;
      transactions: Record<string, unknown>[];
    }) {
      transactions.forEach((transaction) => {
        this._addTransaction(
          getAddTransactionParams({
            ...transaction,
            description: `Bulk Transaction (${bulkTransaction.name})`,
            note: transaction.note,
          })
        );
      });
    },

    deleteBulkTransactionTransaction({
      bulkTransaction,
      transaction,
    }: {
      bulkTransaction: BulkTransaction;
      transaction: { id: string };
    }) {
      requireObjectProperties(transaction, ['id']);
      const { id } = transaction;
      delete this.bulkTransactionTransactions[id];
      const tIndex = bulkTransaction.transactionIds.indexOf(id);
      if (tIndex !== -1) {
        bulkTransaction.transactionIds.splice(tIndex, 1);
      }
      bulkTransaction.lastModified = new Date().toISOString();
    },

    _addUpdateBulkTransactionTransaction({
      transaction,
      bulkTransaction,
    }: {
      transaction: { to: string; from: string; value: string; note?: string; id: string };
      bulkTransaction: BulkTransaction;
    }) {
      requireObjectProperties(transaction, ['to', 'from', 'value', 'id']);
      const { to, from, value, note, id } = transaction;
      this.bulkTransactionTransactions[id] = { to, from, value, note, id };
      if (!bulkTransaction.transactionIds.includes(id)) {
        bulkTransaction.transactionIds.push(id);
      }
      bulkTransaction.lastModified = new Date().toISOString();
    },
  },
});
