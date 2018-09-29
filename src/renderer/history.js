import json2csv from 'json2csv';
import moment from 'moment';

import ipc from './ipc';
import menu from './menu';

const actionNames = {
  addTransaction: 'Add transaction',
  addDualTransaction: 'Add transaction',
  deleteAccount: 'Delete account',
  runBulkTransactionTransactions: 'Run bulk transactions',
  updateBulkTransactionTransaction: 'Update transaction',
  addBulkTransactionTransaction: 'Add transaction',
  addBulkTransaction: 'Add bulk transaction',
  addAccount: 'Add account'
};
const storePrefix = 'project/';

const history = {
  install(Vue, { store, ready }) {
    let done = [];
    let undone = [];
    let newAction = true;
    let initData;

    store.subscribeAction(action => {
      if (!action.type.startsWith(storePrefix)) return;

      done.push(action);
      ipc.setEdited();
      menu.updateUndoLabel(actionNames[action.type.replace(storePrefix, '')]);
      if (newAction) {
        menu.updateRedoLabel();
        undone = [];
      }
    });

    ipc.on('projectOpened', (event, data) => {
      initData = data;
      store.commit(`${storePrefix}init`, initData);
      ipc.setSaved();
      ready();
    });
    ipc.openDefaultProject();

    let canClose = false;
    window.addEventListener('beforeunload', e => {
      if (!canClose && done.length > 0) {
        ipc.showCloseWarning(store.state.project);
        e.returnValue = false;
      }
    });

    ipc.on('closeConfirmed', () => {
      canClose = true;
      window.close();
    });

    Vue.prototype.$history = {
      undo() {
        if (done.length === 0) return;

        const toUndo = done.pop();
        undone.push(toUndo);
        menu.updateRedoLabel(actionNames[toUndo.type.replace(storePrefix, '')]);

        newAction = false;
        store.commit(`${storePrefix}init`, initData);
        done.forEach(action => {
          store.dispatch(action.type, action.payload);
          done.pop();
        });
        store.commit(`${storePrefix}updateSummaryBalance`);
        newAction = true;

        if (done.length === 0) {
          menu.updateUndoLabel();
          ipc.setSaved();
        }
      },
      redo() {
        if (undone.length === 0) return;

        const action = undone.pop();
        newAction = false;
        store.dispatch(action.type, action.payload);
        newAction = true;

        if (undone.length === 0) {
          menu.updateRedoLabel();
        }
      },
      save() {
        done = [];
        undone = [];
        ipc.saveProject(store.state.project);
        ipc.setSaved();
      },
      open() {
        ipc.openProject();
      },
      saveAs() {
        done = [];
        undone = [];
        ipc.saveProjectAs(store.state.project);
        ipc.setSaved();
      },
      new() {
        ipc.newProject();
      },
      exportSummary() {
        const summary = store.state.project.accounts.map(account => ({
          Name: account.name,
          Category: account.category,
          Type: account.type,
          Balance: Number(account.balance)
        }));
        ipc.exportCsv('summary', json2csv.parse(summary));
      },
      exportTransactions() {
        const accountNamesById = store.state.project.accounts.reduce(
          (acc, account) => ({
            ...acc,
            [account.id]: account.name
          }),
          {}
        );
        const transactions = Object.values(store.state.project.transactions)
          .sort((a, b) => {
            const aDateValue = new Date(a.date).valueOf();
            const bDateValue = new Date(b.date).valueOf();
            return aDateValue - bDateValue;
          })
          .map(transaction => ({
            Date: moment(transaction.date).format('YYYY-MM-DD'),
            From: accountNamesById[transaction.from],
            To: accountNamesById[transaction.to],
            Expense: accountNamesById[transaction.expense],
            Description: transaction.description,
            Note: transaction.note,
            Value: Number(transaction.value)
          }));
        ipc.exportCsv('transactions', json2csv.parse(transactions));
      }
    };
  }
};

export default history;
