import Big from 'big.js';

import { useProjectStore } from '@/store';

import {
  getInit,
  getNewTransaction,
  getNewAccount,
  getNewBulkTransaction,
} from './utils';

describe('getters', () => {
  let store;
  let init;

  beforeEach(() => {
    store = useProjectStore();
    init = getInit(store);
    init();
  });

  describe('accounts', () => {
    it('should return accounts', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      const accounts = store.activeAccounts;
      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toMatchObject(account);
    });

    it('should not return deleted accounts', () => {
      const account = getNewAccount();
      account.deleted = true;
      init({
        accounts: [account],
      });
      const accounts = store.activeAccounts;
      expect(accounts).toHaveLength(0);
    });
  });

  describe('deletedAccounts', () => {
    it('should return deleted accounts', () => {
      const account1 = getNewAccount('a');
      const account2 = getNewAccount('b');
      account1.deleted = true;
      init({ accounts: [account1, account2] });
      const accounts = store.deletedAccounts;
      expect(accounts).toHaveLength(1);
    });
  });

  describe('accountItems', () => {
    it('gets account items', () => {
      const accountA = getNewAccount('a');
      const accountB = getNewAccount('b');
      const accountC = getNewAccount('c');
      const accountD = getNewAccount('d');
      accountD.name = 'a';
      init({
        accounts: [accountB, accountC, accountA, accountD],
      });
      const accounts = store.accountItems;
      expect(accounts).toHaveLength(4);
      expect(accounts[0].title).toBe('a');
      expect(accounts[1].title).toBe('a');
      expect(accounts[2]).toMatchObject({
        title: accountB.name,
        value: accountB.id,
      });
      expect(accounts[3]).toMatchObject({
        title: accountC.name,
        value: accountC.id,
      });
    });

    it("doesn't return deleted accounts", () => {
      const account = getNewAccount('a');
      account.deleted = true;
      init({
        accounts: [account],
      });
      const accounts = store.accountItems;
      expect(accounts).toHaveLength(0);
    });
  });

  describe('accountsByCategory', () => {
    it('gets accounts by category', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      const accounts = store.accountsByCategory('test');
      expect(accounts).toHaveLength(1);
    });
  });

  describe('account', () => {
    it('gets account by id', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      expect(store.getAccount(account.id)).toEqual(account);
    });

    it('gets a deleted account', () => {
      const account = getNewAccount();
      account.deleted = true;
      init({
        accounts: [account],
      });
      expect(store.getAccount(account.id)).toEqual(account);
    });
  });

  describe('accountByName', () => {
    it('gets account by name', () => {
      const account = getNewAccount();
      init({
        accounts: [account],
      });
      expect(store.getAccountByName(account.name)).toEqual(account);
    });
  });

  describe('transactions', () => {
    it('gets transactions by account', () => {
      const account = getNewAccount();
      const transaction = getNewTransaction();
      account.transactionIds = [transaction.id];
      init({
        accounts: [account],
        transactions: {
          test: transaction,
        },
      });

      const transactions = store.getTransactions(account);
      expect(transactions[0]).toEqual(transaction);
    });
  });

  describe('transaction', () => {
    it('gets transaction by id', () => {
      const transaction = getNewTransaction();
      init({
        transactions: { [transaction.id]: transaction },
      });
      expect(store.getTransaction(transaction.id)).toEqual(transaction);
    });
  });

  describe('summaryBalance', () => {
    it('gets summary balance', () => {
      const balance = 3;
      init({
        summary: {
          balance,
        },
      });
      expect(store.summaryBalance).toBe(balance);
    });
  });

  describe('summaryBalanceEqualsZero', () => {
    it('returns true if 0', () => {
      init({
        summary: {
          balance: 0,
        },
      });
      expect(store.summaryBalanceEqualsZero).toBe(true);
    });

    it('returns false if not 0', () => {
      init({
        summary: {
          balance: 3,
        },
      });
      expect(store.summaryBalanceEqualsZero).toBe(false);
    });
  });

  describe('accountsTotal', () => {
    it('sums accounts balances by category', () => {
      const account1 = getNewAccount('1');
      account1.balance = 3;
      const account2 = getNewAccount('2');
      account2.balance = 5;
      init({
        accounts: [account1, account2],
      });
      expect(store.accountsTotal(account1.category)).toMatchObject(
        new Big(account1.balance + account2.balance)
      );
    });
  });

  describe('bulkTransactions', () => {
    it('returns bulk transactions sorted by date', () => {
      const bulkTransaction1 = getNewBulkTransaction('1');
      const bulkTransaction2 = getNewBulkTransaction('2');
      bulkTransaction1.lastModified = '2010-01-01T00:00:00.000Z';
      init({
        bulkTransactions: [bulkTransaction1, bulkTransaction2],
      });
      const bulkTransactions = store.sortedBulkTransactions;
      expect(bulkTransactions[0]).toMatchObject(bulkTransaction2);
      expect(bulkTransactions[1]).toMatchObject(bulkTransaction1);
    });
  });

  describe('bulkTransactionTransactions', () => {
    it('returns transactions for a bulk transaction', () => {
      const bulkTransaction = getNewBulkTransaction();
      const transaction = getNewTransaction();
      bulkTransaction.transactionIds = [transaction.id];
      init({
        bulkTransactions: [bulkTransaction],
        bulkTransactionTransactions: { [transaction.id]: transaction },
      });
      expect(
        store.getBulkTransactionTransactions(bulkTransaction)[0]
      ).toMatchObject(transaction);
    });

    it('includes the ID in the returned transactions (for older bulk transactions)', () => {
      const bulkTransaction = getNewBulkTransaction();
      const transaction = getNewTransaction();
      bulkTransaction.transactionIds = [transaction.id];
      init({
        bulkTransactions: [bulkTransaction],
        bulkTransactionTransactions: { [transaction.id]: transaction },
      });
      expect(store.getBulkTransactionTransactions(bulkTransaction)[0].id).toBe(
        transaction.id
      );
    });
  });

  describe('accountBalance', () => {
    it('returns the balance for an account at a specific time of a transaction', () => {
      const account = getNewAccount();
      const transaction1 = getNewTransaction('1');
      transaction1.value = new Big('1');
      const transaction2 = getNewTransaction('2');
      transaction2.value = new Big('2');

      account.transactionIds = [transaction1.id, transaction2.id];
      init({
        accounts: [account],
        transactions: {
          [transaction1.id]: transaction1,
          [transaction2.id]: transaction2,
        },
      });

      expect(store.getAccountBalance(account, transaction1.id)).toMatchObject(
        new Big(-2)
      );
      expect(store.getAccountBalance(account, transaction2.id)).toMatchObject(
        new Big(0)
      );
    });
  });
});
