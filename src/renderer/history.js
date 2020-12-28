import { unparse } from 'papaparse';
import moment from 'moment';

import ipc from './ipc';
import { setSaveEnabled, setUndoLabel, setRedoLabel } from './menu';

const actionNames = {
  addTransaction: 'Add transaction',
  addDualTransaction: 'Add transaction',
  addDualTransactions: 'Add transactions',
  updateTransaction: 'Update transaction',
  updateDualTransaction: 'Update transaction',
  deleteAccount: 'Delete account',
  runBulkTransactionTransactions: 'Run bulk transactions',
  deleteBulkTransactionTransaction: 'Delete bulk transaction',
  addBulkTransaction: 'Add bulk transaction',
  addAccount: 'Add account',
  editAccount: 'Edit account',
  addAccountCategory: 'Add account category',
  updateBulkTransaction: 'Apply bulk transaction changes',
};
const storePrefix = 'project/';

function setEdited(edited) {
  ipc.setEdited(edited);
  setSaveEnabled(edited);
}

const history = {
  install(Vue, { store, router, ready }) {
    const done = [];
    let undone = [];
    let newAction = true;
    let initData;
    let savedDoneLength = 0;

    store.subscribeAction((action) => {
      if (!action.type.startsWith(storePrefix)) return;

      done.push(action);
      setEdited(true);
      setUndoLabel(actionNames[action.type.replace(storePrefix, '')]);
      if (newAction) {
        setRedoLabel();
        undone = [];
      }
    });

    ipc.on('projectOpened', (event, data) => {
      const callReady = !initData;
      initData = data;
      store.commit(`${storePrefix}init`, initData);
      setEdited(false);
      if (callReady) {
        ready();
      } else {
        router.push({ name: 'accounts' });
      }
    });
    ipc.openDefaultProject();

    let canClose = false;
    window.addEventListener('beforeunload', (e) => {
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
        setRedoLabel(actionNames[toUndo.type.replace(storePrefix, '')]);

        newAction = false;
        store.commit(`${storePrefix}init`, initData);
        done.forEach((action) => {
          store.dispatch(action.type, action.payload);
          done.pop();
        });
        store.commit(`${storePrefix}updateSummaryBalance`);
        newAction = true;

        if (done.length === 0) {
          setUndoLabel();
        }

        if (done.length === savedDoneLength) {
          setUndoLabel();
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
          setRedoLabel();
        }

        if (done.length === savedDoneLength) {
          setRedoLabel();
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
        const summary = store.state.project.accounts.map((account) => ({
          Name: account.name,
          Category: account.category,
          Type: account.type,
          Balance: Number(account.balance),
        }));
        ipc.exportCsv('summary', unparse(summary));
      },
      exportTransactions() {
        const accountNamesById = store.state.project.accounts.reduce(
          (acc, account) => ({
            ...acc,
            [account.id]: account.name,
          }),
          {}
        );
        const transactions = Object.values(store.state.project.transactions)
          .sort((a, b) => {
            const aDateValue = new Date(a.date).valueOf();
            const bDateValue = new Date(b.date).valueOf();
            return aDateValue - bDateValue;
          })
          .map((transaction) => ({
            Date: moment(transaction.date).format('YYYY-MM-DD'),
            From: accountNamesById[transaction.from],
            To: accountNamesById[transaction.to],
            Expense: accountNamesById[transaction.expense],
            Description: transaction.description,
            Note: transaction.note,
            Value: Number(transaction.value),
          }));
        ipc.exportCsv('transactions', unparse(transactions));
      },
    };
  },
};

export default history;
