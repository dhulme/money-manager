import ipc from './ipc';

const history = {
  install(Vue, store) {
    let done = [];
    let undone = [];
    let newAction = true;
    let initData;

    store.subscribeAction((action) => {
      done.push(action);
      ipc.setEdited();
      if (newAction) {
        undone = [];
      }
    });

    ipc.on('projectOpened', (event, data) => {
      initData = data;
      console.log('hi');
      store.commit('init', initData);
      ipc.setSaved();
    });
    ipc.openProject();

    Vue.prototype.$history = {
      undo() {
        const toUndo = done.pop();
        console.log(toUndo);
        undone.push(toUndo);

        newAction = false;
        store.commit('init', initData);
        done.forEach((action) => {
          store.dispatch(action.type, action.payload);
          done.pop();
        });
        store.commit('updateSummaryBalance');
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
    };
  },
};

export default history;
