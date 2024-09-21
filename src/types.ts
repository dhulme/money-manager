export type AccountCategory = {
  id: string;
  name: string;
  type: 'asset' | 'budget';
};

export type Account = {
  balance: string;
  category: string; // AccountCategory.id
  id: string; // human readable
  name: string;
  transactionIds: string[];
  type: 'asset' | 'budget' | 'none';
  deleted: boolean;
  importTransactionsFormatId: string;
};

export type Transaction = {
  id: string;
  value: string;
  from: string; // Account.id
  to: string; // Account.id
  date: string;
  description: string;
  expense: string; // Account.id
  note: string;
  highlighted: boolean;
  linkedTransaction?: string; // for dual transactions, so they can be edited as one
};

export type Summary = {
  balance: string;
};

export type BulkTransaction = {
  description: string;
  id: string; // human readable
  name: string;
  transactionIds: string[];
  lastModified: Date;
};

export type BulkTransactionTransaction = {
  from: string; // Account.id
  to: string; // Account.id
  value: string;
  note: string;
  id: string; // human readable
};

export type Settings = {
  projectPath: string;
  lastBackupDates: Record<string, string>; // ?
  currencyPrefix: string;
  dateFormat: string;
};

export type Project = {
  accountCategories: AccountCategory[];
  accounts: Account[];
  transactions: Record<string, Transaction>;
  summary: Summary;
  bulkTransactions: Record<string, BulkTransaction>;
  bulkTransactionTransactions: Record<string, BulkTransactionTransaction>;
};
