import { unparse } from 'papaparse';
import moment from 'moment';

import ipc from './ipc';
import menu from './menu';

const actionNames = {
  addTransaction: 'Add transaction',
  addDualTransaction: 'Add transaction',
  addDualTransactions: 'Add transactions',
  updateTransaction: 'Update transaction',
  deleteAccount: 'Delete account',
  runBulkTransactionTransactions: 'Run bulk transactions',
  updateBulkTransactionTransaction: 'Update transaction',
  deleteBulkTransactionTransaction: 'Delete bulk transaction',
  addBulkTransactionTransaction: 'Add transaction',
  addBulkTransaction: 'Add bulk transaction',
  addAccount: 'Add account',
  editAccount: 'Edit account'
};
const storePrefix = 'project/';

function setEdited(edited) {
  ipc.setEdited(edited);
  menu.setSaveEnabled(edited);
}

const history = {
  install(Vue, { store, ready }) {
    const done = [];
    let undone = [];
    let newAction = true;
    let initData;
    let savedDoneLength = 0;

    store.subscribeAction(action => {
      if (!action.type.startsWith(storePrefix)) return;

      done.push(action);
      setEdited(true);
      menu.setUndoLabel(actionNames[action.type.replace(storePrefix, '')]);
      if (newAction) {
        menu.setRedoLabel();
        undone = [];
      }
    });

    ipc.on('projectOpened', (event, data) => {
      initData = data;
      store.commit(`${storePrefix}init`, initData);
      setEdited(false);
      ready();
    });
    ipc.openDefaultProject();

    let canClose = false;
    window.addEventListener('beforeunload', e => {
      if (
        process.env.NODE_ENV === 'production' &&
        !canClose &&
        done.length !== savedDoneLength
      ) {
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
        menu.setRedoLabel(actionNames[toUndo.type.replace(storePrefix, '')]);

        newAction = false;
        store.commit(`${storePrefix}init`, initData);
        done.forEach(action => {
          store.dispatch(action.type, action.payload);
          done.pop();
        });
        store.commit(`${storePrefix}updateSummaryBalance`);
        newAction = true;

        if (done.length === 0) {
          menu.setUndoLabel();
        }

        if (done.length === savedDoneLength) {
          menu.setUndoLabel();
        }
        setEdited(done.length !== savedDoneLength);
      },
      redo() {
        if (undone.length === 0) return;

        const action = undone.pop();
        newAction = false;
        store.dispatch(action.type, action.payload);
        newAction = true;

        if (undone.length === 0) {
          menu.setRedoLabel();
        }

        if (done.length === savedDoneLength) {
          menu.setRedoLabel();
        }
        setEdited(done.length !== savedDoneLength);
      },
      save() {
        savedDoneLength = done.length;
        ipc.saveProject(store.state.project);
        setEdited(false);
      },
      open() {
        ipc.openProject();
      },
      saveAs() {
        savedDoneLength = done.length;
        ipc.saveProjectAs(store.state.project);
        setEdited(false);
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
        ipc.exportCsv('summary', unparse(summary));
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
        ipc.exportCsv('transactions', unparse(transactions));
      }
    };
  }
};

export default history;
