import { parse } from 'papaparse';
import moment from 'moment';

import { capitalizeFirstLetter } from './util';
import ipc from './ipc';
import store from './store';

function handleCsvErrors(errors) {
  store.commit(
    'setError',
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
    toTransactions(csvData) {
      let { data, errors } = parse(csvData, {
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
              date: moment(row.Date, 'DD/MM/YYYY'),
              description: capitalizeFirstLetter(description.toLowerCase()),
              value: Math.abs(value),
              type: value < 0 ? 'out' : 'in',
            };
          });
    },
  },
  {
    id: 'capitalOne',
    name: 'Capital One',
    type: 'account',
    extensions: ['csv'],
    toTransactions(csvData) {
      const { data, errors } = parse(csvData, {
        header: true,
      });

      return errors.length
        ? handleCsvErrors(errors)
        : data.map((row) => ({
            date: moment(row.date),
            description: capitalizeFirstLetter(row.description.toLowerCase()),
            value: Number(row.amount),
            type: row.debitCreditCode === 'Credit' ? 'in' : 'out',
          }));
    },
  },
  {
    id: 'santanderText',
    name: 'Santander Text',
    extensions: ['txt'],
    type: 'account',
    toTransactions(textData) {
      const transactions = textData
        .split('\n')
        .slice(4)
        .join('\n')
        .split('\t\t\t\t\t\t\n');

      return transactions.map((transaction) => {
        const value = Number(transaction.match(/Amount:�(.+)�/)[1]);
        return {
          date: moment(transaction.match(/Date:�(.+)/)[1], 'DD/MM/YYYY'),
          description: capitalizeFirstLetter(
            transaction.match(/Description:�(.+)/)[1].toLowerCase()
          ),
          value: Math.abs(value),
          type: value < 0 ? 'out' : 'in',
        };
      });
    },
  },
  {
    id: 'moneyManagerBulkTransactions',
    name: 'Money Manager Bulk Transactions',
    extensions: ['tsv'],
    type: 'bulkTransaction',
    toTransactions(tsvData) {
      const { data, errors } = parse(tsvData, {
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
];

export const importAccountTransactionsFormatItems = importTransactionsFormats
  .filter((format) => format.type === 'account')
  .map((format) => ({
    text: format.name,
    value: format.id,
  }));

ipc.on('importTransactionsDone', (event, { data, id }) => {
  try {
    const transactions = importTransactionsFormats
      .find((_) => _.id === id)
      .toTransactions(data);
    if (transactions) {
      store.commit('setImportedTransactions', transactions);
    }
  } catch (e) {
    console.error(e);
    handleCsvErrors();
  }
});
