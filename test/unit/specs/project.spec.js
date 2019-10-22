// import Vue from 'vue';
// // import HelloWorld from '../../../src/renderer/components/HelloWorld';

// describe('HelloWorld.vue', () => {
//   it('should render correct contents', () => {
//     const Constructor = Vue.extend(HelloWorld);
//     const vm = new Constructor().$mount();
//     expect(vm.$el.querySelector('.hello h1').textContent)
//       .toBe('Welcome to Your Vue.js App');
//   });
// });

import store from '@/store';

function getNewAccount(id = 'test') {
  return {
    name: id,
    id,
    balance: '0',
    type: 'test',
    category: 'test',
    transactionIds: [],
    deleted: false
  };
}

function getNewTransaction(id = 'test') {
  return {
    to: 'to',
    from: 'from',
    value: 10,
    id
  };
}

describe('project store', () => {
  const state = store.state.project;

  function commit(name, data) {
    store.commit(`project/${name}`, data);
  }

  function dispatch(name, data) {
    store.dispatch(`project/${name}`, data);
  }

  function init({
    accounts = [],
    transactions = {},
    summary = {
      balance: 0
    },
    bulkTransactions = [],
    bulkTransactionTransactions = {}
  }) {
    state.accounts = accounts;
    state.transactions = transactions;
    state.summary = summary;
    state.bulkTransactions = bulkTransactions;
    state.bulkTransactionTransactions = bulkTransactionTransactions;
  }

  it('should initialize correctly', () => {
    expect(state.summary.balance).toBe(0);
    expect(state.accounts).toHaveLength(0);
    expect(state.transactions).toEqual({});
    expect(state.bulkTransactions).toHaveLength(0);
    expect(state.bulkTransactionTransactions).toEqual({});
  });

  describe('mutations', () => {
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
        init({});
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
        init({});
        expect(() => {
          commit('addAccount', {});
        }).toThrowError('required');
      });

      it('should add an account', () => {
        const account = getNewAccount();
        init({});
        commit('addAccount', account);
        expect(state.accounts).toContainEqual(account);
      });

      it('should not allow duplicate IDs', () => {
        const account = getNewAccount();
        init({});
        commit('addAccount', account);
        expect(() => {
          commit('addAccount', account);
        }).toThrowError('Duplicate');
      });
    });

    describe('addBulkTransaction', () => {
      it('should require parameters', () => {
        init({});
        expect(() => {
          commit('addBulkTransaction', {});
        }).toThrowError('required');
      });

      it('should add a bulk transaction', () => {
        const bulkTransaction = {
          description: 'test',
          name: 'test'
        };
        init({});
        commit('addBulkTransaction', bulkTransaction);
        expect(state.bulkTransactions[0]).toMatchObject({
          ...bulkTransaction,
          id: 'test',
          transactionIds: []
        });
      });

      it('should not allow duplicate IDs', () => {
        const bulkTransaction = {
          description: 'test',
          name: 'test'
        };
        init({});
        commit('addBulkTransaction', bulkTransaction);
        expect(() => {
          commit('addBulkTransaction', bulkTransaction);
        }).toThrowError('Duplicate');
      });
    });

    describe('addUpdateBulkTransactionTransaction', () => {
      it('should require parameters', () => {
        init({});
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

      it('should add a bulk transaction transaction', () => {
        const bulkTransaction = {
          transactionIds: []
        };
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
      });
    });

    describe('deleteBulkTransactionTransaction', () => {
      it('should require parameters', () => {
        init({});
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
        expect(
          state.bulkTransactionTransactions[transaction.id]
        ).toBeUndefined();
        expect(bulkTransaction.transactionIds).toEqual(['test1', 'test3']);
      });
    });
  });

  describe('actions', () => {
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

    describe('addBulkTransaction', () => {
      it('should run without errors', () => {
        dispatch('addBulkTransaction', {
          description: 'test',
          name: 'test',
          transactions: [getNewTransaction()]
        });
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
  });
});
