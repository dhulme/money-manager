import Big from 'big.js';
import Vue from 'vue';
import moment from 'moment';

import { requireObjectProperties, required, getFriendlyId } from '../../util';

export default {
  init(state, data) {
    const clonedData = JSON.parse(JSON.stringify(data));

    // Old accounts may not have deleted flag set, which causes reactivity issues if deleted
    if (Array.isArray(clonedData.accounts)) {
      clonedData.accounts.forEach((account) => {
        if (account.deleted === undefined) {
          account.deleted = false;
        }
      });
    }

    state.accounts = clonedData.accounts;
    state.accountCategories = clonedData.accountCategories;
    state.transactions = clonedData.transactions;
    state.summary = clonedData.summary;
    state.bulkTransactions = clonedData.bulkTransactions;
    state.bulkTransactionTransactions = clonedData.bulkTransactionTransactions;
  },

  addTransaction(
    state,
    {
      transaction = required('transaction'),
      value = required('value'),
      toAccountId = required('toAccountId'),
      fromAccountId = required('fromAccountId'),
    }
  ) {
    requireObjectProperties(transaction, ['id', 'value', 'from', 'to']);

    Vue.set(state.transactions, transaction.id, transaction);
    const fromAccount = state.accounts.find((_) => _.id === fromAccountId);
    if (!fromAccount) {
      throw new Error(`Cannot find 'from' account called ${fromAccountId}`);
    }
    fromAccount.balance = new Big(fromAccount.balance).minus(value);
    fromAccount.transactionIds.push(transaction.id);

    const toAccount = state.accounts.find((_) => _.id === toAccountId);
    if (!toAccount) {
      throw new Error(`Cannot find 'to' account called ${fromAccountId}`);
    }
    toAccount.balance = new Big(toAccount.balance).add(value);
    toAccount.transactionIds.push(transaction.id);
  },

  updateTransaction(state, transaction) {
    requireObjectProperties(transaction, ['id', 'value', 'from', 'to']);
    const currentTransaction = state.transactions[transaction.id];
    if (!currentTransaction) {
      throw new Error(`Cannot find transaction with ID ${transaction.id}`);
    }

    const balanceDifference = new Big(transaction.value).minus(
      currentTransaction.value
    );

    const fromAccount = state.accounts.find((_) => _.id === transaction.from);
    if (!fromAccount) {
      throw new Error(`Cannot find 'from' account called ${transaction.from}`);
    }
    fromAccount.balance = new Big(fromAccount.balance).minus(balanceDifference);

    const toAccount = state.accounts.find((_) => _.id === transaction.to);
    if (!toAccount) {
      throw new Error(`Cannot find 'to' account called ${transaction.to}`);
    }
    toAccount.balance = new Big(toAccount.balance).add(balanceDifference);

    state.transactions[transaction.id] = {
      ...transaction,
    };
  },

  updateSummaryBalance(state) {
    state.summary.balance = state.accounts.reduce((total, account) => {
      if (account.type === 'none') {
        return total;
      }

      if (account.type === 'budget') {
        return total.minus(account.balance);
      }

      return total.plus(account.balance);
    }, new Big(0));
  },

  setAccountDeleted(
    state,
    {
      accountId = required('accountId'),
      deleted = required('deleted'),
    } = required('params')
  ) {
    const account = state.accounts.find((_) => _.id === accountId);
    account.deleted = deleted;
  },

  addAccount(state, account = required('account')) {
    requireObjectProperties(account, ['name', 'balance', 'type', 'category']);
    const {
      name,
      balance,
      type,
      category,
      importTransactionsFormatId,
    } = account;
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
    state.accounts.push(newAccount);
  },

  editAccount(state, newAccount = required('account')) {
    requireObjectProperties(newAccount, ['name', 'id']);
    const account = state.accounts.find((_) => _.id === newAccount.id);
    state.accounts.splice(state.accounts.indexOf(account), 1, {
      ...account,
      ...newAccount,
    });
  },

  addAccountCategory(state, category) {
    requireObjectProperties(category, ['name', 'type']);
    const id = getFriendlyId(category.name);
    state.accountCategories.push({
      id,
      name: category.name,
      type: category.type,
    });
  },

  addBulkTransaction(state, bulkTransaction) {
    requireObjectProperties(bulkTransaction, ['description', 'name']);
    const { description, name } = bulkTransaction;
    const newBulkTransaction = {
      name,
      description,
      id: bulkTransaction.id || getFriendlyId(name),
      transactionIds: [],
      lastModified: bulkTransaction.lastModified || moment(),
    };
    state.bulkTransactions.push(newBulkTransaction);
  },

  updateBulkTransaction(state, bulkTransaction) {
    requireObjectProperties(bulkTransaction, ['description', 'name', 'id']);
    const { description, name, transactionIds, id } = bulkTransaction;
    const index = state.bulkTransactions.findIndex(
      (_) => _.id === bulkTransaction.id
    );
    state.bulkTransactions[index] = {
      id,
      name,
      description,
      transactionIds:
        transactionIds || state.bulkTransactions[index].transactionIds,
      lastModified: moment(),
    };
  },

  addUpdateBulkTransactionTransaction(
    state,
    {
      transaction = required('transaction'),
      bulkTransaction = required('bulkTransaction'),
    }
  ) {
    requireObjectProperties(transaction, ['to', 'from', 'value', 'id']);
    requireObjectProperties(bulkTransaction, ['transactionIds']);
    const { to, from, value, note, id } = transaction;
    Vue.set(state.bulkTransactionTransactions, id, {
      to,
      from,
      value,
      note,
      id,
    });
    if (!bulkTransaction.transactionIds.includes(id)) {
      bulkTransaction.transactionIds.push(id);
    }
    bulkTransaction.lastModified = moment();
  },

  deleteBulkTransactionTransaction(
    state,
    {
      transaction = required('transaction'),
      bulkTransaction = required('bulkTransaction'),
    }
  ) {
    requireObjectProperties(transaction, ['id']);
    const { id } = transaction;
    requireObjectProperties(bulkTransaction, ['transactionIds']);
    Vue.delete(state.bulkTransactionTransactions, id);
    const index = bulkTransaction.transactionIds.indexOf(id);
    if (index !== -1) {
      bulkTransaction.transactionIds.splice(index, 1);
    }
    bulkTransaction.lastModified = moment();
  },
};
