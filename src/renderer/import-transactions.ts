import { parse as parseCsv } from 'papaparse';
import { parse as parseDate } from 'date-fns';

import { capitalizeFirstLetter } from './util';
import ipc from './ipc';
import { useRootStore } from './store/root';
import type { ImportedTransaction } from '../types/project';

function handleCsvErrors(errors?: { row?: number }[]) {
  const rootStore = useRootStore();
  rootStore.setError(
    'Failed to import transactions CSV' +
      (errors && errors.length
        ? `. Errors on rows: ${errors.map((error) => error.row).join(', ')}`
        : '')
  );
}

export const importTransactionsFormats = [
  {
    id: 'midata',
    name: 'midata',
    extensions: ['csv'],
    type: 'account',
    toTransactions(csvData: string) {
      let { data, errors } = parseCsv<Record<string, string>>(csvData, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
      });

      // Ignore summary row
      if (errors.length === 1 && errors[0].code === 'TooFewFields') {
        errors = [];
        data.pop();
      }

      return errors.length
        ? handleCsvErrors(errors)
        : data.map((row) => {
            const value = Number(row['Debit/Credit'].replace(/[^0-9.]/g, ''));
            const description =
              row['Merchant/Description'].replace(/\*/g, '').trim() || row.Type;
            return {
              date: parseDate(row.Date, 'dd/MM/yyyy', new Date()),
              description: capitalizeFirstLetter(description.toLowerCase()),
              value: Math.abs(value),
              type: value < 0 ? 'out' as const : 'in' as const,
            };
          });
    },
  },
  {
    id: 'capitalOne',
    name: 'Capital One',
    type: 'account',
    extensions: ['csv'],
    toTransactions(csvData: string) {
      const { data, errors } = parseCsv<Record<string, string>>(csvData, {
        header: true,
      });

      return errors.length
        ? handleCsvErrors(errors)
        : data.map((row) => ({
            date: new Date(row.date),
            description: capitalizeFirstLetter(row.description.toLowerCase()),
            value: Number(row.amount),
            type: row.debitCreditCode === 'Credit' ? 'in' as const : 'out' as const,
          }));
    },
  },
  {
    id: 'santanderText',
    name: 'Santander Text',
    extensions: ['txt'],
    type: 'account',
    toTransactions(textData: string) {
      const transactions = textData
        .split('\n')
        .slice(4)
        .join('\n')
        .split('\t\t\t\t\t\t\n');

      return transactions.map((transaction) => {
        const value = Number(transaction.match(/Amount:�(.+)�/)![1]);
        return {
          date: parseDate(transaction.match(/Date:�(.+)/)![1], 'dd/MM/yyyy', new Date()),
          description: capitalizeFirstLetter(
            transaction.match(/Description:�(.+)/)![1].toLowerCase()
          ),
          value: Math.abs(value),
          type: value < 0 ? 'out' as const : 'in' as const,
        };
      });
    },
  },
  {
    id: 'moneyManagerBulkTransactions',
    name: 'Money Manager Bulk Transactions',
    extensions: ['tsv'],
    type: 'bulkTransaction',
    toTransactions(tsvData: string) {
      const { data, errors } = parseCsv<Record<string, string>>(tsvData, {
        header: true,
        skipEmptyLines: true,
        delimiter: '\t',
      });
      return errors.length
        ? handleCsvErrors(errors)
        : data.map((row) => ({
            fromName: row.From,
            toName: row.To,
            note: row.Note,
            value: Number(row.Amount.replace(/[\s£,]/g, '')),
          }));
    },
  },
  {
    id: 'lloyds',
    name: 'Lloyds',
    type: 'account',
    extensions: ['csv'],
    toTransactions(csvData: string) {
      console.log('csvData', csvData);
      const { data, errors } = parseCsv<Record<string, string>>(csvData, {
        header: true,
        skipEmptyLines: true,
      });

      return errors.length
        ? handleCsvErrors(errors)
        : data.map((row) => ({
            date: parseDate(row.Date, 'dd/MM/yyyy', new Date()),
            description: capitalizeFirstLetter(row.Description.toLowerCase()),
            value: Math.abs(Number(row.Amount)),
            type: Number(row.Amount) < 0 ? 'in' as const : 'out' as const,
          }));
    },
  },
];

export const importAccountTransactionsFormatItems = importTransactionsFormats
  .filter((format) => format.type === 'account')
  .map((format) => ({
    title: format.name,
    value: format.id,
  }));

ipc.on('importTransactionsDone', (...args: unknown[]) => {
  const { data, id } = args[0] as { data: string; id: string };
  try {
    const transactions = importTransactionsFormats
      .find((_) => _.id === id)!
      .toTransactions(data);
    if (transactions) {
      const rootStore = useRootStore();
      rootStore.setImportedTransactions(transactions as ImportedTransaction[]);
    }
  } catch (e) {
    console.error(e);
    handleCsvErrors();
  }
});
