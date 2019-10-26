import { parse } from 'papaparse';
import moment from 'moment';

import { capitalizeFirstLetter } from './util';
import ipc from './ipc';
import store from './store';

function handleErrors(errors) {
  // TODO
  if (errors.length) {
    throw new Error(errors);
  }
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
      handleErrors(errors);
      return data.map(row => ({
        date: moment(row.Date),
        description: capitalizeFirstLetter(row['Merchant/Description']),
        value: Number(row['Debit/Credit'].replace('£', ''))
      }));
    }
  },
  {
    id: 'capitalOne',
    name: 'Capital One',
    toTransactions(csvData) {
      const { data, errors } = parse(csvData, {
        header: true
      });
      handleErrors(errors);
      return data.map(row => ({
        date: moment(row.date),
        description: capitalizeFirstLetter(row.description.toLowerCase()),
        value: Number(row.amount)
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
