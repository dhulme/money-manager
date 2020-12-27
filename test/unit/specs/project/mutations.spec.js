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

describe('mutations', () => {
  const state = store.state.project;

  const init = getInit(state);
  beforeEach(() => init());

  function commit(name, data) {
    store.commit(`project/${name}`, data);
  }

  describe('init', () => {
    it('should set state properties', () => {
      const test = 'test';
      commit('init', {
        accounts: test,
        transactions: test,
        summary: test,
        bulkTransactions: test,
        bulkTransactionTransactions: test,
      });
      expect(state.accounts).toBe(test);
      expect(state.transactions).toBe(test);
      expect(state.summary).toBe(test);
      expect(state.bulkTransactions).toBe(test);
      expect(state.bulkTransactionTransactions).toBe(test);
    });

    it('should not allow other properties to be set', () => {
      commit('init', {
        test: 'test',
      });
      expect(state.test).toBeUndefined();
    });

    it('should clone the data', () => {
      const accountsData = [];
      commit('init', {
        accounts: accountsData,
      });
      expect(state.accounts).not.toBe(accountsData);
      expect(state.accounts).toEqual([]);
    });
  });

  describe('addTransaction', () => {
    it('should require all parameters', () => {
      expect(() => {
        commit('addTransaction', {});
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
        commit('addTransaction', {
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
        commit('addTransaction', {
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
      commit('addTransaction', {
        transaction,
        value: transaction.value,
        toAccountId: transaction.to,
        fromAccountId: transaction.from,
      });
      expect(state.transactions[transaction.id]).toBe(transaction);
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
        commit('updateTransaction', transaction);
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
      commit('updateTransaction', updatedTransaction);
      expect(state.transactions[transaction.id]).toMatchObject(
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

      commit('updateTransaction', updatedTransaction);
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
      commit('updateSummaryBalance');
      expect(state.summary.balance.toString()).toBe('20');
    });

    it('should subtract budgets', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [], type: 'budget' },
          { id: 'b', balance: 20, transactionIds: [] },
        ],
      });
      commit('updateSummaryBalance');
      expect(state.summary.balance.toString()).toBe('10');
    });

    it('should ignore none accounts', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [], type: 'none' },
          { id: 'b', balance: 10, transactionIds: [], type: 'none' },
        ],
      });
      commit('updateSummaryBalance');
      expect(state.summary.balance.toString()).toBe('0');
    });
  });

  describe('setAccountDeleted', () => {
    it('should require an account ID and deleted flag', () => {
      expect(() => {
        commit('setAccountDeleted');
      }).toThrowError('required');
      expect(() => {
        commit('setAccountDeleted', { deleted: true });
      }).toThrowError('required');
      expect(() => {
        commit('setAccountDeleted', { accountId: 'a' });
      }).toThrowError('required');
    });
    it('should delete an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      commit('setAccountDeleted', { accountId: 'test', deleted: true });
      expect(state.accounts.find((_) => _.id === account.id).deleted).toEqual(
        true
      );
    });
    it('should restore a deleted account', () => {
      const account = getNewAccount();
      account.deleted = true;
      init({
        accounts: [account],
      });
      commit('setAccountDeleted', { accountId: 'test', deleted: false });
      expect(state.accounts.find((_) => _.id === account.id).deleted).toEqual(
        false
      );
    });
  });

  describe('addAccount', () => {
    it('should check new account fields', () => {
      expect(() => {
        commit('addAccount', {});
      }).toThrowError('required');
    });

    it('should add an account', () => {
      const account = getNewAccount();
      commit('addAccount', account);
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
      commit('editAccount', editedAccount);
      expect(state.accounts).toContainEqual(editedAccount);
    });
  });

  describe('addAccountCategory', () => {
    beforeEach(init);

    it('should check new account category fields', () => {
      expect(() => {
        commit('addAccountCategory', {});
      }).toThrowError('required');
    });

    it('should add an account category', () => {
      const category = getNewAccountCategory();
      commit('addAccountCategory', category);
      category.id += '-0';
      expect(state.accountCategories).toContainEqual(category);
    });
  });

  describe('addBulkTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        commit('addBulkTransaction', {});
      }).toThrowError('required');
    });

    it('should add a bulk transaction', () => {
      const bulkTransaction = getNewBulkTransaction();
      commit('addBulkTransaction', bulkTransaction);
      expect(state.bulkTransactions[0]).toMatchObject({
        ...bulkTransaction,
        id: 'test',
        transactionIds: [],
      });
    });
  });

  describe('updateBulkTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        commit('addBulkTransaction', {});
      }).toThrowError('required');
    });

    it('should update a bulk transaction', () => {
      const bulkTransaction = getNewBulkTransaction();
      init({
        bulkTransactions: [bulkTransaction],
      });
      const newName = 'newName';
      commit('updateBulkTransaction', {
        ...bulkTransaction,
        name: newName,
      });
      expect(state.bulkTransactions[0].name).toBe(newName);
    });
  });

  describe('addUpdateBulkTransactionTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        commit('addUpdateBulkTransactionTransaction', {});
      }).toThrowError('required');
      expect(() => {
        commit('addUpdateBulkTransactionTransaction', {
          transaction: {},
          bulkTransaction: {},
        });
      }).toThrowError('required');
    });

    it('should add a bulk transaction transaction and then update it', () => {
      const bulkTransaction = getNewBulkTransaction();
      const transaction = getNewTransaction();
      init({
        bulkTransactions: [bulkTransaction],
      });

      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toEqual(
        transaction
      );
      expect(bulkTransaction.transactionIds).toContain(transaction.id);

      const updatedTransaction = {
        ...transaction,
        note: 'updated',
      };
      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction: updatedTransaction,
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toEqual(
        updatedTransaction
      );
      expect(bulkTransaction.transactionIds).toContain(updatedTransaction.id);
    });
  });

  describe('deleteBulkTransactionTransaction', () => {
    it('should require parameters', () => {
      expect(() => {
        commit('addUpdateBulkTransactionTransaction', {});
      }).toThrowError('required');
      expect(() => {
        commit('addUpdateBulkTransactionTransaction', {
          transaction: {},
          bulkTransaction: {},
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
      commit('deleteBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toBeUndefined();
      expect(bulkTransaction.transactionIds).toEqual(['test1', 'test3']);
    });
  });
});
