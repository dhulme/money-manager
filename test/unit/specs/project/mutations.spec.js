import store from '@/store';

import {
  getInit,
  getNewTransaction,
  getNewAccount,
  getNewBulkTransaction
} from './utils';

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
        bulkTransactionTransactions: test
      });
      expect(state.accounts).toBe(test);
      expect(state.transactions).toBe(test);
      expect(state.summary).toBe(test);
      expect(state.bulkTransactions).toBe(test);
      expect(state.bulkTransactionTransactions).toBe(test);
    });

    it('should not allow other properties to be set', () => {
      commit('init', {
        test: 'test'
      });
      expect(state.test).toBeUndefined();
    });

    it('should clone the data', () => {
      const accountsData = [];
      commit('init', {
        accounts: accountsData
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
        accounts: [fromAccount, toAccount]
      });
      expect(() => {
        commit('addTransaction', {
          transaction,
          value: transaction.value,
          toAccountId: transaction.to,
          fromAccountId: 'bob'
        });
      }).toThrowError("Cannot find 'from' account");
    });

    it('should error if missing "to" account', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount]
      });
      expect(() => {
        commit('addTransaction', {
          transaction,
          value: transaction.value,
          fromAccountId: transaction.from,
          toAccountId: 'bob'
        });
      }).toThrowError("Cannot find 'to' account");
    });

    it('should add the transaction correctly', () => {
      const transaction = getNewTransaction();
      const fromAccount = getNewAccount('from');
      const toAccount = getNewAccount('to');
      init({
        accounts: [fromAccount, toAccount]
      });
      commit('addTransaction', {
        transaction,
        value: transaction.value,
        toAccountId: transaction.to,
        fromAccountId: transaction.from
      });
      expect(state.transactions[transaction.id]).toBe(transaction);
      expect(fromAccount.balance.toString()).toEqual('-10');
      expect(fromAccount.transactionIds).toContain('test');
      expect(toAccount.balance.toString()).toEqual('10');
      expect(toAccount.transactionIds).toContain('test');
    });
  });

  describe('updateSummaryBalance', () => {
    it('should sum accounts', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [] },
          { id: 'b', balance: 10, transactionIds: [] }
        ]
      });
      commit('updateSummaryBalance');
      expect(state.summary.balance.toString()).toBe('20');
    });

    it('should subtract budgets', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [], type: 'budget' },
          { id: 'b', balance: 20, transactionIds: [] }
        ]
      });
      commit('updateSummaryBalance');
      expect(state.summary.balance.toString()).toBe('10');
    });

    it('should ignore none accounts', () => {
      init({
        accounts: [
          { id: 'a', balance: 10, transactionIds: [], type: 'none' },
          { id: 'b', balance: 10, transactionIds: [], type: 'none' }
        ]
      });
      commit('updateSummaryBalance');
      expect(state.summary.balance.toString()).toBe('0');
    });
  });

  describe('deleteAccount', () => {
    it('should require an account ID', () => {
      expect(() => {
        commit('deleteAccount');
      }).toThrowError('required');
    });
    it('should delete an account', () => {
      const account = getNewAccount();
      init({
        accounts: [account]
      });
      commit('deleteAccount', 'test');
      expect(state.accounts.find(_ => _.id === account.id).deleted).toEqual(
        true
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
      expect(state.accounts).toContainEqual(account);
    });

    it('should not allow duplicate IDs', () => {
      const account = getNewAccount();
      commit('addAccount', account);
      expect(() => {
        commit('addAccount', account);
      }).toThrowError('Duplicate');
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
        transactionIds: []
      });
    });

    it('should not allow duplicate IDs', () => {
      const bulkTransaction = getNewBulkTransaction();
      delete bulkTransaction.id;
      commit('addBulkTransaction', bulkTransaction);
      expect(() => {
        commit('addBulkTransaction', bulkTransaction);
      }).toThrowError('Duplicate');
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
          bulkTransaction: {}
        });
      }).toThrowError('required');
    });

    it('should add a bulk transaction transaction and then update it', () => {
      const bulkTransaction = getNewBulkTransaction();
      const transaction = getNewTransaction();
      init({
        bulkTransactions: [bulkTransaction]
      });

      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toEqual(
        transaction
      );
      expect(bulkTransaction.transactionIds).toContain(transaction.id);

      const updatedTransaction = {
        ...transaction,
        note: 'updated'
      };
      commit('addUpdateBulkTransactionTransaction', {
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
    it('should require parameters', () => {
      expect(() => {
        commit('addUpdateBulkTransactionTransaction', {});
      }).toThrowError('required');
      expect(() => {
        commit('addUpdateBulkTransactionTransaction', {
          transaction: {},
          bulkTransaction: {}
        });
      }).toThrowError('required');
    });

    it('should delete a bulk transaction transaction', () => {
      const bulkTransaction = {
        transactionIds: ['test1', 'test2', 'test3']
      };
      const transaction = getNewTransaction('test2');
      init({
        bulkTransactions: [bulkTransaction]
      });
      commit('deleteBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
      expect(state.bulkTransactionTransactions[transaction.id]).toBeUndefined();
      expect(bulkTransaction.transactionIds).toEqual(['test1', 'test3']);
    });
  });
});
