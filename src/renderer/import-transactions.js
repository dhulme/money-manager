import { parse } from 'papaparse';
import moment from 'moment';

import { capitalizeFirstLetter } from './util';
import ipc from './ipc';
import store from './store';

function handleErrors(errors) {
  store.commit(
    'setError',
    'Failed to import transactions CSV' +
      (errors && errors.length
        ? `. Errors on rows: ${errors.map(error => error.row).join(', ')}`
        : '')
  );
}

export const importTransactionsFormats = [
  {
    id: 'midata',
    name: 'midata',
    toTransactions(csvData) {
      const { data, errors } = parse(csvData, {
        header: true,
        delimiter: ';'
      });

      return errors.length
        ? handleErrors(errors)
        : data.map(row => {
            const value = Number(row['Debit/Credit'].replace('£', ''));
            return {
              date: moment(row.Date),
              description: capitalizeFirstLetter(row['Merchant/Description']),
              value: Math.abs(value),
              type: value < 0 ? 'out' : 'in'
            };
          });
    }
  },
  {
    id: 'capitalOne',
    name: 'Capital One',
    toTransactions(csvData) {
      const { data, errors } = parse(csvData, {
        header: true
      });

      return errors.length
        ? handleErrors(errors)
        : data.map(row => ({
            date: moment(row.date),
            description: capitalizeFirstLetter(row.description.toLowerCase()),
            value: Number(row.amount),
            type: row.debitCreditCode === 'Credit' ? 'in' : 'out'
          }));
    }
  }
];

export const importTransactionsFormatItems = importTransactionsFormats.map(
  format => ({
    text: format.name,
    value: format.id
  })
);

ipc.on('importTransactionsDone', (event, { data, format }) => {
  try {
    const transactions = importTransactionsFormats
      .find(_ => _.id === format)
      .toTransactions(data);
    if (transactions) {
      store.commit('setImportedTransactions', transactions);
    }
  } catch (e) {
    console.error(e);
    handleErrors();
  }
});
