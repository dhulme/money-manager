import moment from 'moment';

export function getNewAccount(id = 'test') {
  return {
    name: id,
    id,
    balance: '0',
    type: 'test',
    category: 'test',
    transactionIds: [],
    deleted: false,
    importTransactionsFormatId: null
  };
}

export function getNewTransaction(id = 'test') {
  return {
    to: 'to',
    from: 'from',
    value: 10,
    id
  };
}

export function getNewBulkTransaction(id = 'test') {
  return {
    description: 'test',
    id,
    name: 'test',
    transactionIds: [],
    lastModified: moment()
  };
}

export const getInit = state => ({
  accounts = [],
  accountCategories = [],
  transactions = {},
  summary = {
    balance: 0
  },
  bulkTransactions = [],
  bulkTransactionTransactions = {}
} = {}) => {
  state.accounts = accounts;
  state.accountCategories = accountCategories;
  state.transactions = transactions;
  state.summary = summary;
  state.bulkTransactions = bulkTransactions;
  state.bulkTransactionTransactions = bulkTransactionTransactions;
};

export function getNewAccountCategory(id = 'test') {
  return {
    name: 'test',
    id,
    type: 'asset'
  };
}
