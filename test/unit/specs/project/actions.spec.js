import store from '@/store';

import {
  getInit,
  getNewTransaction,
  getNewAccount,
  getNewBulkTransaction
} from './utils';

describe('actions', () => {
  const state = store.state.project;

  const init = getInit(state);
  beforeEach(() => init());

  function dispatch(name, data) {
    store.dispatch(`project/${name}`, data);
  }

  describe('addTransaction', () => {
    it('should add a transaction', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount]
      });
      dispatch('addTransaction', transaction);
      expect(state.transactions[transaction.id]).toMatchObject(transaction);
    });
  });

  describe('addDualTransaction', () => {
    it('should add a primary and secondary transaction', () => {
      const primary = getNewTransaction();
      const secondary = getNewTransaction('test2');
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount]
      });
      dispatch('addDualTransaction', { primary, secondary });
      expect(state.transactions[primary.id]).toMatchObject(primary);
      expect(state.transactions[secondary.id]).toMatchObject(secondary);
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
        transactions: {
          [transaction.id]: transaction
        }
      });
      const updatedTransaction = {
        ...transaction,
        description: 'updated'
      };
      dispatch('updateTransaction', updatedTransaction);
      expect(state.transactions[transaction.id]).toMatchObject(
        updatedTransaction
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account]
      });
      dispatch('deleteAccount', 'test');
      expect(state.accounts.find(_ => _.id === account.id).deleted).toEqual(
        true
      );
    });
  });

  describe('runBulkTransactionTransactions', () => {
    it('should add the transactions', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount]
      });
      dispatch('runBulkTransactionTransactions', {
        bulkTransaction: {
          description: 'test'
        },
        transactions: [transaction]
      });

      expect(state.transactions[transaction.id]).toMatchObject({
        ...transaction,
        description: 'Bulk Transaction (test)',
        highlighted: false
      });
    });
  });

  describe('updateBulkTransactionTransaction', () => {
    it('should update a bulk transaction transaction', () => {
      const transaction = getNewTransaction();
      const bulkTransaction = getNewBulkTransaction();
      bulkTransaction.transactionIds = [transaction.id];
      init({
        bulkTransactions: [bulkTransaction]
      });
      const updatedTransaction = {
        ...transaction,
        note: 'updated'
      };
      dispatch('updateBulkTransactionTransaction', {
        bulkTransaction,
        transaction: updatedTransaction
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toEqual(
        updatedTransaction
      );
      expect(bulkTransaction.transactionIds).toContain(updatedTransaction.id);
    });
  });

  describe('deleteBulkTransactionTransaction', () => {
    it('should delete a bulk transaction transaction', () => {
      const transaction = getNewTransaction();
      const bulkTransaction = getNewBulkTransaction();
      bulkTransaction.transactionIds = [transaction.id];
      init({
        bulkTransactions: [bulkTransaction]
      });
      dispatch('deleteBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toBeUndefined();
      expect(bulkTransaction.transactionIds).not.toContain(transaction.id);
    });
  });

  describe('addBulkTransactionTransaction', () => {
    it('should add a bulk transaction transaction', () => {
      const bulkTransaction = getNewBulkTransaction();
      const transaction = getNewTransaction();
      init({
        bulkTransactions: [bulkTransaction]
      });
      dispatch('addBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toEqual(
        transaction
      );
      expect(bulkTransaction.transactionIds).toContain(transaction.id);
    });
  });

  describe('addBulkTransaction', () => {
    it('should run without errors', () => {
      dispatch('addBulkTransaction', {
        description: 'test',
        name: 'test',
        transactions: [getNewTransaction()]
      });
    });
  });

  describe('addAccount', () => {
    it('should add an account', () => {
      const account = getNewAccount();
      dispatch('addAccount', account);
      expect(state.accounts).toContainEqual(account);
    });
  });

  describe('editAccount', () => {
    it('should edit an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account]
      });
      const editedAccount = {
        ...account,
        name: 'edited'
      };
      dispatch('editAccount', editedAccount);
      expect(state.accounts).toContainEqual(editedAccount);
    });
  });
});
