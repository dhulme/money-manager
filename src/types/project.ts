import type Big from 'big.js';

export type AccountType = 'asset' | 'budget' | 'none';

export interface AccountCategory {
  id: string;
  name: string;
  type: AccountType;
}

export interface Account {
  id: string;
  name: string;
  balance: string | Big;
  type: AccountType;
  category?: string;
  transactionIds: string[];
  deleted?: boolean;
  importTransactionsFormatId?: string;
}

export type TransactionType = 'in' | 'out';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  value: string;
  from: string;
  to: string;
  note?: string;
  highlighted?: boolean;
}

export interface BulkTransaction {
  id: string;
  name: string;
  description: string;
  transactionIds: string[];
  lastModified?: string;
}

export interface BulkTransactionTransaction {
  id: string;
  to: string;
  from: string;
  value: string;
  note?: string;
}

export interface Summary {
  balance: string | Big;
}

export interface ProjectData {
  accountCategories: AccountCategory[];
  accounts: Account[];
  transactions: Record<string, Transaction>;
  summary: Summary;
  bulkTransactions: BulkTransaction[];
  bulkTransactionTransactions: Record<string, BulkTransactionTransaction>;
}

export interface ImportedTransaction {
  date: Date;
  description: string;
  value: number;
  type: TransactionType;
}
