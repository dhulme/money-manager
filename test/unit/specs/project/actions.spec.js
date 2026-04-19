import { vi } from 'vitest';
import { useProjectStore } from '@/store';

import {
  getInit,
  getNewTransaction,
  getNewAccount,
  getNewBulkTransaction,
  getNewAccountCategory,
} from './utils';

vi.mock('@/util', () => ({
  required: (param) => { throw new Error(`${param} is required`); },
  requireObjectProperties: (object, params) => {
    const errors = params.filter((p) => object[p] === undefined);
    if (errors.length) throw new Error(`${errors.join(',')} is required`);
  },
  getId: () => '0',
  getFriendlyId: (name) => name.toLowerCase().replace(/[ ]/g, '-') + '-0',
  capitalizeFirstLetter: (s) => s.charAt(0).toUpperCase() + s.slice(1),
  validateInputValue: () => true,
}));

describe('actions', () => {
  let store;
  let init;

  beforeEach(() => {
    store = useProjectStore();
    init = getInit(store);
    init();
  });

  describe('addTransaction', () => {
    it('should add a transaction', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
      });
      store.addTransaction(transaction);
      expect(store.transactions[transaction.id]).toMatchObject(transaction);
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
      store.addDualTransaction({ primary, secondary });
      expect(store.transactions[primary.id]).toMatchObject(primary);
      expect(store.transactions[secondary.id]).toMatchObject(secondary);
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
      store.addDualTransactions([{ primary, secondary }]);
      expect(store.transactions[primary.id]).toMatchObject(primary);
      expect(store.transactions[secondary.id]).toMatchObject(secondary);
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
      store.updateTransaction(updatedTransaction);
      expect(store.transactions[transaction.id]).toMatchObject(
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
      store.updateDualTransaction({
        primary: updatedPrimary,
        secondary: updatedSecondary,
      });
      expect(store.transactions[primary.id]).toMatchObject(updatedPrimary);
      expect(store.transactions[secondary.id]).toMatchObject(updatedSecondary);
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      store.deleteAccount('test');
      expect(store.accounts.find((_) => _.id === account.id).deleted).toEqual(
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
      store.restoreDeletedAccount('test');
      expect(store.accounts.find((_) => _.id === account.id).deleted).toEqual(
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
      store.runBulkTransactionTransactions({
        bulkTransaction: {
          name: 'test',
        },
        transactions: [transaction],
      });

      expect(store.transactions[transaction.id]).toMatchObject({
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
      store.deleteBulkTransactionTransaction({
        bulkTransaction,
        transaction,
      });
      expect(store.bulkTransactionTransactions[transaction.id]).toBeUndefined();
      expect(bulkTransaction.transactionIds).not.toContain(transaction.id);
    });
  });

  describe('addBulkTransaction', () => {
    it('should run without errors', () => {
      store.addBulkTransaction({
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
      store.updateBulkTransaction({
        ...bulkTransaction,
        name: newName,
      });
      expect(store.bulkTransactions[0].name).toBe(newName);
    });

    it('should update the bulk transaction transactions', () => {
      const bulkTransaction = getNewBulkTransaction();
      init({
        bulkTransactions: [bulkTransaction],
      });
      const transaction = getNewTransaction();
      store.updateBulkTransaction({
        ...bulkTransaction,
        transactions: [transaction],
      });
      expect(store.bulkTransactionTransactions[transaction.id]).toEqual(
        transaction
      );
      const updateBulkTransaction = store.bulkTransactions[0];
      expect(updateBulkTransaction.transactionIds).toContain(transaction.id);
    });
  });

  describe('addAccount', () => {
    it('should add an account', () => {
      const account = getNewAccount();
      store.addAccount(account);
      account.id += '-0';
      expect(store.accounts).toContainEqual(account);
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
      store.editAccount(editedAccount);
      expect(store.accounts).toContainEqual(editedAccount);
    });
  });

  describe('addAccountCategory', () => {
    it('should an account category', () => {
      const category = getNewAccountCategory();
      store.addAccountCategory(category);
      category.id += '-0';
      expect(store.accountCategories).toContainEqual(category);
    });
  });
});
