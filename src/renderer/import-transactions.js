import { parse } from 'papaparse';
import moment from 'moment';
import Big from 'big.js';

import util from './util';
import ipc from './ipc';
import store from './store';

export const importTransactionsFormats = [
  {
    id: 'capitalOne',
    name: 'Capital One',
    toTransactions(csvData) {
      const { data, errors } = parse(csvData, {
        header: true
      });
      if (errors.length) {
        throw new Error(errors);
      }
      return data.map(row => ({
        date: moment(row.date),
        description: util.capitalizeFirstLetter(row.description.toLowerCase()),
        value: new Big(row.amount)
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
  const transactions = importTransactionsFormats
    .find(_ => _.id === format)
    .toTransactions(data);
  store.commit('setImportedTransactions', transactions);
});
