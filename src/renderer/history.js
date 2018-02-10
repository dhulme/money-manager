import project from './project';
import ipc from './ipc';

const history = {
  install(Vue, store) {
    let done = [];
    let undone = [];
    let newMutation = true;

    store.subscribe((mutation) => {
      if (mutation.type !== 'init' && mutation.type !== 'updateSummaryBalance') {
        done.push(mutation);
        ipc.setEdited();
      }
      if (newMutation) {
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

        newMutation = false;
        await Vue.history.init();
        done.forEach((mutation) => {
          store.commit(mutation.type, mutation.payload);
          done.pop();
        });
        store.commit('updateSummaryBalance');
        newMutation = true;

        if (done.length === 0) {
          ipc.setSaved();
        }
      },
      redo() {
        const commit = undone.pop();
        newMutation = false;
        store.commit(commit.type, commit.payload);
        newMutation = true;
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
