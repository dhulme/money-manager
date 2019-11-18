import Big from 'big.js';

export default {
  accounts(state) {
    return state.accounts;
  },
  accountItems(state) {
    return state.accounts
      .sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      })
      .map(account => ({
        text: account.name,
        value: account.id
      }));
  },
  accountsByCategory(state) {
    return category =>
      state.accounts.filter(
        account => account.category === category && !account.deleted
      );
  },
  account(state) {
    return id => state.accounts.find(account => account.id === id);
  },
  transactions(state) {
    return account => account.transactionIds.map(id => state.transactions[id]);
  },
  transaction(state) {
    return id => state.transactions[id];
  },
  summaryBalance(state) {
    return state.summary.balance;
  },
  summaryBalanceEqualsZero(state) {
    return new Big(state.summary.balance).eq(0);
  },
  accountsTotal(state, getters) {
    return category =>
      getters
        .accountsByCategory(category)
        .reduce((total, account) => total.plus(account.balance), new Big(0));
  },
  bulkTransactions(state) {
    return state.bulkTransactions.sort(
      (a, b) =>
        new Date(b.lastModified || 0).valueOf() -
        new Date(a.lastModified || 0).valueOf()
    );
  },
  bulkTransaction(state) {
    return id => state.bulkTransactions.find(_ => _.id === id);
  },
  bulkTransactionTransactions(state) {
    return bulkTransaction =>
      bulkTransaction.transactionIds.map(
        id => state.bulkTransactionTransactions[id]
      );
  },
  accountBalance(state) {
    return (account, transactionId) => {
      const transactionIds = account.transactionIds.slice(
        account.transactionIds.indexOf(transactionId) + 1
      );
      return transactionIds.reduce((balance, id) => {
        const transaction = state.transactions[id];
        return transaction.from === account.id
          ? balance.plus(transaction.value)
          : balance.minus(transaction.value);
      }, new Big(account.balance));
    };
  }
};
