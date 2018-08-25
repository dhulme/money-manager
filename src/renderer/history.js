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
  install(Vue, store) {
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
    });
    ipc.openDefaultProject();

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
        ipc.saveProjectAs(store.state.project);
      },
      new() {
        ipc.newProject();
      }
    };
  }
};

export default history;
