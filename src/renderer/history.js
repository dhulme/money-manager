import project from './project';
import ipc from './ipc';

const history = {
  install(Vue, store) {
    let done = [];
    let undone = [];
    let newAction = true;

    store.subscribeAction((action) => {
      done.push(action);
      ipc.setEdited();
      if (newAction) {
        undone = [];
      }
    });
    
    Vue.history = {
      async init() {
        const data = await project.load();
        store.commit('init', data);
        ipc.setSaved();
      },
    };

    Vue.prototype.$history = {
      async undo() {
        undone.push(done.pop());

        newAction = false;
        await Vue.history.init();
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
        ipc.setSaved();
        return project.save(store.state.project);
      },
    };
  },
};

export default history;
