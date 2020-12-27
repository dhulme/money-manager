import store from '@/store';

import {
  getInit,
  getNewTransaction,
  getNewAccount,
  getNewBulkTransaction,
  getNewAccountCategory,
} from './utils';

import cryptoRandomString from 'crypto-random-string';

jest.mock('crypto-random-string');
cryptoRandomString.mockReturnValue('0');

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
        accounts: [fromAccount, toAccount],
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
        accounts: [fromAccount, toAccount],
      });
      dispatch('addDualTransaction', { primary, secondary });
      expect(state.transactions[primary.id]).toMatchObject(primary);
      expect(state.transactions[secondary.id]).toMatchObject(secondary);
    });
  });

  describe('addDualTransactions', () => {
    it('should add an array of dual transactions', () => {
      const primary = getNewTransaction();
      const secondary = getNewTransaction('test2');
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
      });
      dispatch('addDualTransactions', [{ primary, secondary }]);
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
          [transaction.id]: transaction,
        },
      });
      const updatedTransaction = {
        ...transaction,
        description: 'updated',
      };
      dispatch('updateTransaction', updatedTransaction);
      expect(state.transactions[transaction.id]).toMatchObject(
        updatedTransaction
      );
    });
  });

  describe('updateDualTransaction', () => {
    it('should update both transactions', () => {
      const primary = getNewTransaction('test1');
      const secondary = getNewTransaction('test2');
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
        transactions: {
          [primary.id]: primary,
          [secondary.id]: secondary,
        },
      });
      const updatedPrimary = {
        ...primary,
        description: 'updated',
      };
      const updatedSecondary = {
        ...secondary,
        description: 'updated',
      };
      dispatch('updateDualTransaction', {
        primary: updatedPrimary,
        secondary: updatedSecondary,
      });
      expect(state.transactions[primary.id]).toMatchObject(updatedPrimary);
      expect(state.transactions[secondary.id]).toMatchObject(updatedSecondary);
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      dispatch('deleteAccount', 'test');
      expect(state.accounts.find((_) => _.id === account.id).deleted).toEqual(
        true
      );
    });
  });

  describe('restoreDeletedAccount', () => {
    it('should restore a deleted account', () => {
      const account = getNewAccount();
      account.deleted = true;
      init({
        accounts: [account],
      });
      dispatch('restoreDeletedAccount', 'test');
      expect(state.accounts.find((_) => _.id === account.id).deleted).toEqual(
        false
      );
    });
  });

  describe('runBulkTransactionTransactions', () => {
    it('should add the transactions', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
      });
      dispatch('runBulkTransactionTransactions', {
        bulkTransaction: {
          name: 'test',
        },
        transactions: [transaction],
      });

      expect(state.transactions[transaction.id]).toMatchObject({
        ...transaction,
        description: 'Bulk Transaction (test)',
        highlighted: false,
      });
    });
  });

  describe('deleteBulkTransactionTransaction', () => {
    it('should delete a bulk transaction transaction', () => {
      const transaction = getNewTransaction();
      const bulkTransaction = getNewBulkTransaction();
      bulkTransaction.transactionIds = [transaction.id];
      init({
        bulkTransactions: [bulkTransaction],
      });
      dispatch('deleteBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toBeUndefined();
      expect(bulkTransaction.transactionIds).not.toContain(transaction.id);
    });
  });

  describe('addBulkTransaction', () => {
    it('should run without errors', () => {
      dispatch('addBulkTransaction', {
        description: 'test',
        name: 'test',
        transactions: [getNewTransaction()],
      });
    });
  });

  describe('updateBulkTransaction', () => {
    it('should update the bulk transaction', () => {
      const bulkTransaction = getNewBulkTransaction();
      init({
        bulkTransactions: [bulkTransaction],
      });
      const newName = 'newName';
      dispatch('updateBulkTransaction', {
        ...bulkTransaction,
        name: newName,
      });
      expect(state.bulkTransactions[0].name).toBe(newName);
    });

    it('should update the bulk transaction transactions', () => {
      const bulkTransaction = getNewBulkTransaction();
      init({
        bulkTransactions: [bulkTransaction],
      });
      const transaction = getNewTransaction();
      dispatch('updateBulkTransaction', {
        ...bulkTransaction,
        transactions: [transaction],
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toEqual(
        transaction
      );
      const updateBulkTransaction = state.bulkTransactions[0];
      expect(updateBulkTransaction.transactionIds).toContain(transaction.id);
    });
  });

  describe('addAccount', () => {
    it('should add an account', () => {
      const account = getNewAccount();
      dispatch('addAccount', account);
      account.id += '-0';
      expect(state.accounts).toContainEqual(account);
    });
  });

  describe('editAccount', () => {
    it('should edit an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      const editedAccount = {
        ...account,
        name: 'edited',
      };
      dispatch('editAccount', editedAccount);
      expect(state.accounts).toContainEqual(editedAccount);
    });
  });

  describe('addAccountCategory', () => {
    it('should an account category', () => {
      const category = getNewAccountCategory();
      dispatch('addAccountCategory', category);
      category.id += '-0';
      expect(state.accountCategories).toContainEqual(category);
    });
  });
});
