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

describe('mutations', () => {
  let store;
  let init;

  beforeEach(() => {
    store = useProjectStore();
    init = getInit(store);
    init();
  });

  describe('init', () => {
    it('should set state properties', () => {
      const test = 'test';
      store.init({
        accounts: test,
        transactions: test,
        summary: test,
        bulkTransactions: test,
        bulkTransactionTransactions: test,
      });
      expect(store.accounts).toBe(test);
      expect(store.transactions).toBe(test);
      expect(store.summary).toBe(test);
      expect(store.bulkTransactions).toBe(test);
      expect(store.bulkTransactionTransactions).toBe(test);
    });

    it('should not allow other properties to be set', () => {
      store.init({
        test: 'test',
      });
      expect(store.test).toBeUndefined();
    });

    it('should clone the data', () => {
      const accountsData = [];
      store.init({
        accounts: accountsData,
      });
      expect(store.accounts).not.toBe(accountsData);
      expect(store.accounts).toEqual([]);
    });
  });

  describe('addTransaction', () => {
    it('should require all parameters', () => {
      expect(() => {
        store._addTransaction({});
      }).toThrowError('required');
    });

    it('should error if missing "from" account', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
      });
      expect(() => {
        store._addTransaction({
          transaction,
          value: transaction.value,
          toAccountId: transaction.to,
          fromAccountId: 'bob',
        });
      }).toThrowError("Cannot find 'from' account");
    });

    it('should error if missing "to" account', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
      });
      expect(() => {
        store._addTransaction({
          transaction,
          value: transaction.value,
          fromAccountId: transaction.from,
          toAccountId: 'bob',
        });
      }).toThrowError("Cannot find 'to' account");
    });

    it('should add the transaction correctly', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
      });
      store._addTransaction({
        transaction,
        value: transaction.value,
        toAccountId: transaction.to,
        fromAccountId: transaction.from,
      });
      expect(store.transactions[transaction.id]).toEqual(transaction);
      expect(fromAccount.balance.toString()).toEqual('-10');
      expect(fromAccount.transactionIds).toContain('test');
      expect(toAccount.balance.toString()).toEqual('10');
      expect(toAccount.transactionIds).toContain('test');
    });
  });

  describe('updateTransaction', () => {
    it('should check transaction exist', () => {
      const transaction = getNewTransaction();
      expect(() => {
        store._updateTransaction(transaction);
      }).toThrowError('Cannot find transaction');
    });

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
      store._updateTransaction(updatedTransaction);
      expect(store.transactions[transaction.id]).toMatchObject(
        updatedTransaction
      );
    });

    it('should update the account balances', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount],
        transactions: {
          [transaction.id]: transaction,
        },
      });
      const offset = 500;
      fromAccount.balance = offset - transaction.value;
      toAccount.balance = offset + transaction.value;

      const newValue = 20;
      const updatedTransaction = {
        ...transaction,
        value: newValue,
      };

      store._updateTransaction(updatedTransaction);
      expect(fromAccount.balance.toString()).toBe(
        (offset - newValue).toString()
      );
      expect(toAccount.balance.toString()).toBe((offset + newValue).toString());
    });
  });

  describe('updateSummaryBalance', () => {
    it('should sum accounts', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [] },
          { id: 'b', balance: 10, transactionIds: [] },
        ],
      });
      store.updateSummaryBalance();
      expect(store.summary.balance.toString()).toBe('20');
    });

    it('should subtract budgets', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [], type: 'budget' },
          { id: 'b', balance: 20, transactionIds: [] },
        ],
      });
      store.updateSummaryBalance();
      expect(store.summary.balance.toString()).toBe('10');
    });

    it('should ignore none accounts', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [], type: 'none' },
          { id: 'b', balance: 10, transactionIds: [], type: 'none' },
        ],
      });
      store.updateSummaryBalance();
      expect(store.summary.balance.toString()).toBe('0');
    });
  });

  describe('setAccountDeleted', () => {
    it('should require an account ID and deleted flag', () => {
      expect(() => {
        store.setAccountDeleted();
      }).toThrowError('required');
      expect(() => {
        store.setAccountDeleted({ deleted: true });
      }).toThrowError('required');
      expect(() => {
        store.setAccountDeleted({ accountId: 'a' });
      }).toThrowError('required');
    });
    it('should delete an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      store.setAccountDeleted({ accountId: 'test', deleted: true });
      expect(store.accounts.find((_) => _.id === account.id).deleted).toEqual(
        true
      );
    });
    it('should restore a deleted account', () => {
      const account = getNewAccount();
      account.deleted = true;
      init({
        accounts: [account],
      });
      store.setAccountDeleted({ accountId: 'test', deleted: false });
      expect(store.accounts.find((_) => _.id === account.id).deleted).toEqual(
        false
      );
    });
  });

  describe('addAccount', () => {
    it('should check new account fields', () => {
      expect(() => {
        store.addAccount({});
      }).toThrowError('required');
    });

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
    beforeEach(() => init());

    it('should check new account category fields', () => {
      expect(() => {
        store.addAccountCategory({});
      }).toThrowError('required');
    });

    it('should add an account category', () => {
      const category = getNewAccountCategory();
      store.addAccountCategory(category);
      category.id += '-0';
      expect(store.accountCategories).toContainEqual(category);
    });
  });

  describe('addBulkTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        store.addBulkTransaction({});
      }).toThrowError('required');
    });

    it('should add a bulk transaction', () => {
      const bulkTransaction = getNewBulkTransaction();
      store.addBulkTransaction({ ...bulkTransaction, transactions: [] });
      expect(store.bulkTransactions[0]).toMatchObject({
        name: bulkTransaction.name,
        description: bulkTransaction.description,
        id: 'test-0',
        transactionIds: [],
      });
    });
  });

  describe('updateBulkTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        store.addBulkTransaction({});
      }).toThrowError('required');
    });

    it('should update a bulk transaction', () => {
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
  });

  describe('addUpdateBulkTransactionTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        store._addUpdateBulkTransactionTransaction({
          transaction: {},
          bulkTransaction: { transactionIds: [] },
        });
      }).toThrowError('required');
    });

    it('should add a bulk transaction transaction and then update it', () => {
      const bulkTransaction = getNewBulkTransaction();
      const transaction = getNewTransaction();
      init({
        bulkTransactions: [bulkTransaction],
      });

      store._addUpdateBulkTransactionTransaction({
        bulkTransaction,
        transaction,
      });
      expect(store.bulkTransactionTransactions[transaction.id]).toEqual(
        transaction
      );
      expect(bulkTransaction.transactionIds).toContain(transaction.id);

      const updatedTransaction = {
        ...transaction,
        note: 'updated',
      };
      store._addUpdateBulkTransactionTransaction({
        bulkTransaction,
        transaction: updatedTransaction,
      });
      expect(store.bulkTransactionTransactions[transaction.id]).toEqual(
        updatedTransaction
      );
      expect(bulkTransaction.transactionIds).toContain(updatedTransaction.id);
    });
  });

  describe('deleteBulkTransactionTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        store._addUpdateBulkTransactionTransaction({
          transaction: {},
          bulkTransaction: { transactionIds: [] },
        });
      }).toThrowError('required');
    });

    it('should delete a bulk transaction transaction', () => {
      const bulkTransaction = {
        transactionIds: ['test1', 'test2', 'test3'],
      };
      const transaction = getNewTransaction('test2');
      init({
        bulkTransactions: [bulkTransaction],
      });
      store.deleteBulkTransactionTransaction({
        bulkTransaction,
        transaction,
      });
      expect(store.bulkTransactionTransactions[transaction.id]).toBeUndefined();
      expect(bulkTransaction.transactionIds).toEqual(['test1', 'test3']);
    });
  });
});
