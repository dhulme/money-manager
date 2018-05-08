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
  addAccount: 'Add account',
};
const storePrefix = 'project/';

const history = {
  install(Vue, store) {
    let done = [];
    let undone = [];
    let newAction = true;
    let initData;

    store.subscribeAction((action) => {
      if (!action.type.startsWith(storePrefix)) return;

      done.push(action);
      ipc.setEdited();
      menu.updateUndoLabel(actionNames[action.type.replace(storePrefix, '')]);
      if (newAction) {
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
        const toUndo = done.pop();
        undone.push(toUndo);

        newAction = false;
        store.commit(`${storePrefix}init`, initData);
        done.forEach((action) => {
          store.dispatch(action.type, action.payload);
          done.pop();
        });
        store.commit(`${storePrefix}updateSummaryBalance`);
        newAction = true;

        if (done.length === 0) {
          ipc.setSaved();
        }
      },
      redo() {
        const action = undone.pop();
        newAction = false;
        store.dispatch(action.type, action.payload);
        newAction = true;
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
      },
    };
  },
};

export default history;
